#![allow(clippy::extra_unused_lifetimes)]
#![allow(clippy::type_complexity)]
#[macro_use]
extern crate diesel;
#[macro_use]
extern crate async_graphql;
#[macro_use]
extern crate log;
#[macro_use]
extern crate serde;
#[macro_use]
extern crate actix;
#[macro_use]
extern crate num_derive;
#[macro_use]
extern crate thiserror;

use actix_cors::Cors;
use actix_web::middleware::Logger;
use actix_web::{dev::Service, guard, web, App, HttpRequest, HttpResponse, HttpServer, Result};
use async_graphql::futures_util::FutureExt;
use async_graphql::http::{playground_source, GraphQLPlaygroundConfig};
use async_graphql::{Data, Schema};
use async_graphql_actix_web::{GraphQLRequest, GraphQLResponse, GraphQLSubscription};
use dotenv::dotenv;

use crate::authentication_token::{ActiveOrgId, JwtToken};
use crate::background_job::register_jobs;
use crate::connection_pool::show_log_connection;
use crate::graphql::context_caching_data::RequestContextCachingData;
use crate::graphql::{build_schema, OpenExamSchema};
use crate::util::{is_local, log_util};

mod authentication_token;
mod authorization;
mod background_job;
mod code_gen;
mod connection_pool;
mod constant;
mod db;
mod error;
mod graphql;
mod helper;
mod mailer;
mod service;
mod util;

fn parse_authorization_token(req: &HttpRequest) -> Option<JwtToken> {
    req.headers()
        .get("authorization")
        .and_then(|val| val.to_str().map(|s| JwtToken(s.to_string())).ok())
}

fn parse_active_org_id(req: &HttpRequest) -> Option<ActiveOrgId> {
    req.headers()
        .get("active-org-id")
        .and_then(|val| val.to_str().map(|s| s.parse::<i32>()).ok())
        .and_then(|active_org_id| active_org_id.map(ActiveOrgId).ok())
}

async fn index(
    schema: web::Data<OpenExamSchema>,
    req: HttpRequest,
    gql_request: GraphQLRequest,
) -> GraphQLResponse {
    let mut request = gql_request.into_inner();

    if let Some(token) = parse_authorization_token(&req) {
        if let Ok(claim) = token.claims() {
            request = request.data(claim);
        }
    };

    if let Some(active_org_id) = parse_active_org_id(&req) {
        request = request.data(active_org_id);
    }

    request = request.data(RequestContextCachingData::new());

    schema.execute(request).await.into()
}

pub async fn on_connection_init(value: serde_json::Value) -> async_graphql::Result<Data> {
    #[derive(Debug, Deserialize)]
    struct Payload {
        authorization: String,
    }

    if let Ok(payload) = serde_json::from_value::<Payload>(value) {
        let mut data = Data::default();
        let token = JwtToken(payload.authorization);
        if let Ok(claim) = token.claims() {
            data.insert(claim);
        }
        data.insert(RequestContextCachingData::new());
        Ok(data)
    } else {
        Err("Please provide access token".into())
    }
}

async fn index_ws(
    schema: web::Data<OpenExamSchema>,
    req: HttpRequest,
    payload: web::Payload,
) -> Result<HttpResponse> {
    let mut data = Data::default();

    if let Some(token) = parse_authorization_token(&req) {
        if let Ok(claim) = token.claims() {
            data.insert(claim);
        }
    }

    data.insert(RequestContextCachingData::new());
    GraphQLSubscription::new(Schema::clone(&*schema))
        .with_data(data)
        .on_connection_init(on_connection_init)
        .start(&req, payload)
}

async fn index_playground() -> Result<HttpResponse> {
    Ok(HttpResponse::Ok()
        .content_type("text/html; charset=utf-8")
        .body(playground_source(
            GraphQLPlaygroundConfig::new("/").subscription_endpoint("/"),
        )))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    log_util::setup_logger().unwrap();
    register_jobs();

    let addr = format!("127.0.0.1:{}", std::env::var("PORT").unwrap());
    let schema = build_schema();
    if is_local() {
        HttpServer::new(move || {
            let cors = Cors::default()
                .allow_any_origin()
                .allow_any_header()
                .allow_any_method();

            App::new()
                .wrap(cors)
                .wrap(Logger::default())
                .app_data(web::Data::new(schema.clone()))
                .service(web::resource("/").guard(guard::Post()).to(index))
                .service(
                    web::resource("/")
                        .guard(guard::Get())
                        .guard(guard::Header("upgrade", "websocket"))
                        .to(index_ws),
                )
                .service(web::resource("/").guard(guard::Get()).to(index_playground))
        })
        .bind(addr)?
        .run()
        .await
    } else {
        HttpServer::new(move || {
            App::new()
                .wrap(Logger::default())
                .wrap_fn(|req, srv| {
                    srv.call(req).map(|res| {
                        show_log_connection();
                        res
                    })
                })
                .app_data(web::Data::new(schema.clone()))
                .service(web::resource("/").guard(guard::Post()).to(index))
                .service(
                    web::resource("/")
                        .guard(guard::Get())
                        .guard(guard::Header("upgrade", "websocket"))
                        .to(index_ws),
                )
                .service(web::resource("/").guard(guard::Get()).to(index_playground))
        })
        .bind(addr)?
        .run()
        .await
    }
}
