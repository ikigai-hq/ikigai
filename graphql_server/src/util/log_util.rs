use fern::colors::{Color, ColoredLevelConfig};

pub fn setup_logger() -> Result<(), fern::InitError> {
    let colors = ColoredLevelConfig::new()
        .error(Color::Red)
        .warn(Color::Yellow)
        .info(Color::Green)
        .debug(Color::White)
        .trace(Color::BrightBlack);

    fern::Dispatch::new()
        .format(move |out, message, record| {
            out.finish(format_args!(
                "{}[{}][{}] {}",
                chrono::Local::now().format("[%Y-%m-%d][%H:%M:%S]"),
                record.target(),
                colors.color(record.level()),
                message
            ))
        })
        .level(log::LevelFilter::Info)
        .chain(std::io::stdout())
        .apply()?;

    Ok(())
}

use async_graphql::async_trait;
use async_graphql::extensions::{
    Extension, ExtensionContext, ExtensionFactory, NextExecute, NextParseQuery,
};
use async_graphql::parser::types::{ExecutableDocument, OperationType, Selection};
use async_graphql::{PathSegment, Response, ServerResult, Variables};
use std::fmt::Write;
use std::sync::Arc;

/// Logger extension for Graphql
pub struct Logger;

impl ExtensionFactory for Logger {
    fn create(&self) -> Arc<dyn Extension> {
        Arc::new(LoggerExtension)
    }
}

struct LoggerExtension;

const NON_ALLOWED_VARIABLE_KEYS: [&str; 4] = ["body", "password", "token", "code"];

fn filter_variable(variables: &Variables) -> Variables {
    let mut new_variable = Variables::default();

    for key in variables.keys() {
        if NON_ALLOWED_VARIABLE_KEYS
            .iter()
            .any(|non_allowed_key| key.contains(non_allowed_key))
        {
            continue;
        }

        if let Some(value) = variables.get(key) {
            new_variable.insert(key.clone(), value.clone());
        }
    }

    new_variable
}

#[async_trait::async_trait]
impl Extension for LoggerExtension {
    async fn parse_query(
        &self,
        ctx: &ExtensionContext<'_>,
        query: &str,
        variables: &Variables,
        next: NextParseQuery<'_>,
    ) -> ServerResult<ExecutableDocument> {
        let document = next.run(ctx, query, variables).await?;
        let is_schema = document
            .operations
            .iter()
            .filter(|(_, operation)| operation.node.ty == OperationType::Query)
            .any(|(_, operation)| operation.node.selection_set.node.items.iter().any(|selection| matches!(&selection.node, Selection::Field(field) if field.node.name.node == "__schema")));
        if !is_schema {
            let content = ctx.stringify_execute_doc(&document, &filter_variable(variables));
            log::info!(
                target: "async-graphql",
                "[Execute] {content}",
            );
        }
        Ok(document)
    }

    async fn execute(
        &self,
        ctx: &ExtensionContext<'_>,
        operation_name: Option<&str>,
        next: NextExecute<'_>,
    ) -> Response {
        let resp = next.run(ctx, operation_name).await;
        if resp.is_err() {
            for err in &resp.errors {
                if !err.path.is_empty() {
                    let mut path = String::new();
                    for (idx, s) in err.path.iter().enumerate() {
                        if idx > 0 {
                            path.push('.');
                        }
                        match s {
                            PathSegment::Index(idx) => {
                                let _ = write!(&mut path, "{}", idx);
                            }
                            PathSegment::Field(name) => {
                                let _ = write!(&mut path, "{}", name);
                            }
                        }
                    }

                    log::error!(
                        target: "async-graphql",
                        "[Error] path={} message={}", path, err.message,
                    );
                } else {
                    log::error!(
                        target: "async-graphql",
                        "[Error] message={}", err.message,
                    );
                }
            }
        }
        resp
    }
}
