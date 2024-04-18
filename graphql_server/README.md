# Graphql Server
Efficient graphql server is written by Rust.

## Prepare Configuration

### Make `.env` file

We use dot env to set up environment variables for `open-exam-graphql-server`.
Use the command below to make a `.env` file from sample env.

```bash
cp .env.sample .env
```
 
### Edit `.env` file

`.env` includes 4 parts: App information, database, storage (s3), and mail server (smtp).
You need to change the Storage and smtp server configuration in `.env`

Our recommendation:
- SMTP Server: You can use Gmail SMTP server to send email. Read this [post](https://mailtrap.io/blog/gmail-smtp/).
- Storage (s3): You can use [minio](https://github.com/minio/minio) (compatible with s3) in the local development.


## Run by docker-compose

We provide `docker-compose.yml` in `graphql-server` directory. You can run graphql server 
by using [docker-compose](https://docs.docker.com/compose/).

### Start `open-exam-graphql-server`

```bash
docker-compse up
```

### Stop `open-exam-graphql-server`

```bash
docker-compse down
```

##  Run by source code (local dev - developer only)

```shell
rust >= 1.71
postgres@14
redis >= 5
```

### 1. Prepare working environment

#### 1.1 Audio waveform (support generate waveform in server side)

Install audiowaveform by following their document:
https://github.com/bbc/audiowaveform?tab=readme-ov-file#installation

#### 1.2 libpq (to work with postgres client)

Ubuntu:
```bash
sudo apt-get install libpq5=12.12-0ubuntu0.20.04.1 && sudo apt-get install libpq-dev
```

macOS:If you're macos user
```shell
brew install postgresql libpq
```

### 2. Database Migration

#### Install Diesel CLI
```shell
cargo install diesel_cli --no-default-features --features postgres --version 2.0.1
```


#### Run Migration
Diesel will use env `DATABASE_URL` in .env to run the migration
```shell
diesel migration run 
```

#### Generate new migration step (optional)
```shell
disel migration generate [migration_name]
```

It will create 2 files `up.sql` and `down.sql` in migration folder.

### 3. Start Server

```shell
cargo run
```
