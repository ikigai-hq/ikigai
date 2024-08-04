pub mod ai_history;
pub mod assignment;
pub mod band_score;
pub mod document;
pub mod file;
pub mod notification;
pub mod page;
pub mod quiz;
pub mod rubric;
pub mod schema;
pub mod space;
pub mod space_member;
pub mod submission;
pub mod user;

pub use ai_history::*;
pub use assignment::*;
pub use band_score::*;
pub use document::*;
pub use file::*;
pub use notification::*;
pub use page::*;
pub use quiz::*;
pub use rubric::*;
pub use space::*;
pub use space_member::*;
pub use submission::*;
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
