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
BUILD_COMMAND="export PATH=/home/ubuntu/.nvm/versions/node/v16.18.1/bin:$PATH && cd ~/zenklass-monorepo/apps/zenklass-landing-page && git fetch origin -a && git reset --hard origin/${BRANCH} && yarn install && yarn build"
START_COMMAND="export PATH=/home/ubuntu/.nvm/versions/node/v16.18.1/bin:$PATH && cd ~/zenklass-monorepo/apps/zenklass-landing-page && pm2 delete landing-page || true && pm2 start 'yarn start' --name landing-page"

echo "BUILD LATEST CODE"
ssh "${SSH_REMOTE}" ""${BUILD_COMMAND}""

echo "START CODE"
ssh "${SSH_REMOTE}" ""${START_COMMAND}""
