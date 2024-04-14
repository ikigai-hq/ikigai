use async_graphql::dataloader::DataLoader;
use async_graphql::extensions::ApolloTracing;
use async_graphql::Schema;

use crate::authorization::init_oso;
use crate::graphql::data_loader::OpenExamDataLoader;
use crate::graphql::open_exam_mutation::OpenExamMutation;
use crate::graphql::open_exam_query::OpenExamQuery;
use crate::graphql::open_exam_subscription::Subscription;
use crate::service::redis::Redis;
use crate::util::log_util::Logger;

pub mod assignment_action;
pub mod context_caching_data;
pub mod data_loader;
pub mod document_action;
pub mod file_action;
pub mod notification_center;
pub mod open_exam_mutation;
pub mod open_exam_query;
pub mod open_exam_subscription;
pub mod organization_action;
pub mod paging;
pub mod quiz_action;
pub mod scalar_type;
pub mod space_action;
pub mod thread_action;
pub mod user_action;
pub mod validator;

pub type OpenExamSchema = Schema<OpenExamQuery, OpenExamMutation, Subscription>;

pub fn build_schema() -> OpenExamSchema {
    let redis = Redis::init();

    Schema::build(
        OpenExamQuery::default(),
        OpenExamMutation::default(),
        Subscription,
    )
    .limit_depth(10)
    .data(redis)
    .data(DataLoader::new(OpenExamDataLoader, tokio::spawn))
    .data(init_oso())
    .extension(Logger)
    .extension(ApolloTracing)
    .finish()
}
