FROM rust:1.75

WORKDIR /app

RUN cargo init .
ADD Cargo.lock /app
ADD Cargo.toml /app

# Cache Build
RUN RUST_BACKTRACE=1 cargo build --all --release
