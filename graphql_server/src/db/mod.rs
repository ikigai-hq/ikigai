pub mod assignments;
pub mod band_score;
pub mod class;
pub mod class_member;
pub mod document_template;
pub mod document_version;
pub mod documents;
pub mod file;
pub mod organization;
pub mod page_block;
pub mod quiz;
pub mod rubric;
pub mod schema;
pub mod threads;
pub mod user;

pub use assignments::*;
pub use band_score::*;
pub use class::*;
pub use class_member::*;
pub use document_template::*;
pub use document_version::*;
pub use documents::*;
pub use file::*;
pub use organization::*;
pub use page_block::*;
pub use quiz::*;
pub use rubric::*;
pub use threads::*;
pub use user::*;

use diesel::r2d2::{ConnectionManager, Pool, PooledConnection};
use diesel::PgConnection;

pub type PostgresPool = Pool<ConnectionManager<PgConnection>>;
pub type Connection = PooledConnection<ConnectionManager<PgConnection>>;

pub fn init_connection_pool(database_url: impl Into<String>, max_size: u32) -> PostgresPool {
    let manager = ConnectionManager::new(database_url);
    Pool::builder()
        .test_on_check_out(true)
        .max_size(max_size)
        .build(manager)
        .expect("Could not build connection pool")
}