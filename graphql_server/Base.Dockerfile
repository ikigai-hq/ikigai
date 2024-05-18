FROM rust:1.75

RUN apt-get update && apt-get -y upgrade && \
    apt-get -y install libpq-dev openssl ca-certificates libssl-dev software-properties-common

RUN add-apt-repository ppa:chris-needham/ppa
RUN apt-get update && apt-get -y install audiowaveform

WORKDIR /app

RUN cargo init .
ADD Cargo.lock /app
ADD Cargo.toml /app

# Cache Build
RUN RUST_BACKTRACE=1 cargo build --all --release
