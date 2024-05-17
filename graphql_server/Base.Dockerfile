FROM rust:1.75

WORKDIR /app

ADD Cargo.lock /app
ADD Cargo.toml /app

# Cache Build
RUN RUST_BACKTRACE=1 cargo build --all --release
