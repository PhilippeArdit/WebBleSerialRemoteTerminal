#!/usr/bin/env bash

if [ ! -d $PROJECT_ROOT/node_modules ]; then
  cp -a /tmp/app/node_modules $PROJECT_ROOT
fi

pwd
tree -I node_modules

#pm2-dev start "$PROJECT_ROOT/server.js"
pm2-dev start "$PROJECT_ROOT/ecosystem.config.js"
