# Graphql Server
Efficient graphql server is being backed by Rust

## Infrastructure Prerequisite

```shell
rust >= 1.70
postgres@14
```

##  Run Server in Local

### 1. Prepare dev/working environment

#### 1.1 Environment variables

Prepare `.env` file from `.env.sample`

```shell
cp .env.sample .env
```
After make a copy .env, you should edit it to fill correct variable.
Note: In the first time run, you should run migration. Read Migration step below

#### 1.2 Audio waveform (support generate waveform in server side)

Install audiowaveform by following their document:
https://github.com/bbc/audiowaveform?tab=readme-ov-file#installation

#### 1.3 libpq (to work with postgres client)

macOS:If you're macos user. Try to install libpq before install diesel-cli

```shell
brew install postgresql libpq
```

### 2. Start Server

```shell
cargo run
```


------

## Database Migration

## Install Diesel CLI
```shell
cargo install diesel_cli --no-default-features --features postgres --version 2.0.1
```


### Run Migration
Diesel will use env `DATABASE_URL` in .env to run the migration
```shell
diesel migration run 
```

### Generate new migration step
```shell
disel migration generate [migration_name]
```

It will create 2 files `up.sql` and `down.sql` in migration folder.
