use actix::*;
use lazy_static::lazy_static;
use std::sync::Mutex;

use crate::db::{init_connection_pool, Connection, PostgresPool};
use crate::error::IkigaiError;

lazy_static! {
    static ref POOL_ADDR: Mutex<Option<Addr<ConnectionPool>>> = Mutex::new(None);
}

pub struct ConnectionPool {
    postgres_pool: PostgresPool,
}

impl Default for ConnectionPool {
    fn default() -> Self {
        let database_url = std::env::var("DATABASE_URL").unwrap();
        let pool_size = std::env::var("DATABASE_CONNECTION_POOL_SIZE").unwrap_or("50".into());
        let pool_size = pool_size.parse().unwrap_or(50);
        let postgres_pool = init_connection_pool(database_url, pool_size);
        Self { postgres_pool }
    }
}

impl Actor for ConnectionPool {
    type Context = Context<Self>;
}

fn get_address() -> Addr<ConnectionPool> {
    let mut pool_addr = POOL_ADDR.lock().unwrap();
    if let Some(pool_addr) = pool_addr.as_ref() {
        pool_addr.clone()
    } else {
        let arbiter = Arbiter::new();
        let addr =
            ConnectionPool::start_in_arbiter(&arbiter.handle(), |_| ConnectionPool::default());
        *pool_addr = Some(addr.clone());

        addr
    }
}

pub async fn get_conn_from_actor() -> Result<Connection, IkigaiError> {
    info!("Actor Connection Pool: Starting Get Connection");
    let conn = get_address().send(GetPostgresConn).await??;
    info!("Actor Connection Pool: Completed Get Connection");
    Ok(conn)
}

#[derive(Message)]
#[rtype(result = "Result<Connection, IkigaiError>")]
pub struct GetPostgresConn;

impl Handler<GetPostgresConn> for ConnectionPool {
    type Result = Result<Connection, IkigaiError>;

    fn handle(&mut self, _: GetPostgresConn, _: &mut Self::Context) -> Self::Result {
        info!(
            "Actor Connection Pool: Connection Pool {:?}",
            self.postgres_pool.state()
        );
        let conn = self.postgres_pool.get()?;
        Ok(conn)
    }
}

#[derive(Message)]
#[rtype(result = "()")]
pub struct LogConnection;

impl Handler<LogConnection> for ConnectionPool {
    type Result = ();

    fn handle(&mut self, _: LogConnection, _: &mut Self::Context) -> Self::Result {
        info!(
            "Show Actor Connection Pool: {:?}",
            self.postgres_pool.state()
        );
    }
}

pub fn show_log_connection() {
    get_address().do_send(LogConnection);
}
