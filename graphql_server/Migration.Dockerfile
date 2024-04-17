FROM rodgers/open-exam-rust-base:latest

RUN apt-get update && apt-get -y upgrade && \
    apt-get -y install libpq-dev openssl ca-certificates libssl-dev

RUN cargo install diesel_cli --no-default-features --features postgres --version 2.0.1

WORKDIR /app

ADD migrations /app/migrations

CMD diesel migration run
