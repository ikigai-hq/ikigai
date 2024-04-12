#!/bin/bash

set -ex

case "$1" in
  # Dev Env
  "master")
  ENV="dev"
  USERNAME=${DEV_REMOTE_USER}
  HOST=${DEV_REMOTE_IP}
  BRANCH="master"
  ;;

  # Staging Env
  "staging")
  ENV="staging"
  USERNAME=${STAGING_REMOTE_USER}
  HOST=${STAGING_REMOTE_IP}
  BRANCH="staging"
  ;;

  "production")
  ENV="production"
  USERNAME=${PRODUCTION_REMOTE_USER}
  HOST=${PRODUCTION_REMOTE_IP}
  BRANCH="production"
  ;;

  *)
  echo "Please follow syntax: bin/deploy.sh master|staging|production"
  exit 1
  ;;
esac

SSH_REMOTE="${USERNAME}@${HOST}"
REMOVE_CACHE_COMMAND="cd ~/zenklass-monorepo/node_modules/ && rm -rf .cache/"
BUILD_COMMAND="export PATH=/home/ubuntu/.nvm/versions/node/v16.18.1/bin:$PATH && cd ~/zenklass-monorepo && git fetch origin -a && git reset --hard origin/${BRANCH} && yarn install && NEXT_PUBLIC_APP_ENV=${ENV} yarn build-lms"
START_COMMAND="export PATH=/home/ubuntu/.nvm/versions/node/v16.18.1/bin:$PATH && cd ~/zenklass-monorepo && pm2 delete lms && NEXT_PUBLIC_APP_ENV=${ENV}  pm2 start 'yarn start-lms' --name lms --update-env -- -NEXT_PUBLIC_APP_ENV=${ENV}"

echo "REMOVE CACHE"
ssh "${SSH_REMOTE}" ""${REMOVE_CACHE_COMMAND}""

echo "BUILD LATEST CODE"
ssh "${SSH_REMOTE}" ""${BUILD_COMMAND}""

echo "START CODE"
ssh "${SSH_REMOTE}" ""${START_COMMAND}""
