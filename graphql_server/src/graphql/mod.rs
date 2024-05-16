use async_graphql::dataloader::DataLoader;
use async_graphql::extensions::ApolloTracing;
use async_graphql::Schema;

use crate::authorization::init_oso;
use crate::graphql::data_loader::IkigaiDataLoader;
use crate::graphql::ikigai_mutation::IkigaiMutation;
use crate::graphql::ikigai_query::IkigaiQuery;
use crate::graphql::ikigai_subscription::Subscription;
use crate::service::redis::Redis;
use crate::util::log_util::Logger;

pub mod assignment_action;
pub mod context_caching_data;
pub mod data_loader;
pub mod document_action;
pub mod file_action;
pub mod ikigai_mutation;
pub mod ikigai_query;
pub mod ikigai_subscription;
pub mod notification_center;
pub mod space_action;
pub mod user_action;
pub mod validator;

pub type IkigaiSchema = Schema<IkigaiQuery, IkigaiMutation, Subscription>;

pub fn build_schema() -> IkigaiSchema {
    let redis = Redis::init();

    Schema::build(
        IkigaiQuery::default(),
        IkigaiMutation::default(),
        Subscription,
    )
    .limit_depth(10)
    .data(redis)
    .data(DataLoader::new(IkigaiDataLoader, tokio::spawn))
    .data(init_oso())
    .extension(Logger)
    .extension(ApolloTracing)
    .finish()
}
