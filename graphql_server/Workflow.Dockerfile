FROM ghcr.io/ikigai-hq/ikigai-base:build-base

WORKDIR /app

RUN rm -rf /app/src
RUN rm -rf /app/target/release/deps/graphql-server*
ADD src /app/src
ADD Cargo.toml /app/
ADD Cargo.lock /app/

RUN rustup component add clippy
CMD RUST_BACKTRACE=1 cargo clippy --all-features -- -D warnings
