FROM rust:1.78

WORKDIR /app

RUN cargo init .
ADD Cargo.lock /app
ADD Cargo.toml /app

# Cache Clippy & Build
RUN rustup component add clippy
RUN cargo clippy --all-features -- -D warnings
RUN RUST_BACKTRACE=1 cargo build --all --release
