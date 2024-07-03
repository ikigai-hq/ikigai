FROM rust:1.71.1-slim-bullsey

RUN cargo install diesel_cli --no-default-features --features postgres --version 2.0.1

WORKDIR /app

ADD migrations /app/migrations

CMD diesel migration run
