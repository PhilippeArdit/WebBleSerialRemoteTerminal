#!/usr/bin/env bash

if [ ! -d $PROJECT_ROOT/node_modules ]; then
  cp -a /tmp/app/node_modules $PROJECT_ROOT
fi

pwd
touch /opt/app/logs/access.log
touch /opt/app/logs/app.log

pm2-dev start "$PROJECT_ROOT/ecosystem.config.js"
