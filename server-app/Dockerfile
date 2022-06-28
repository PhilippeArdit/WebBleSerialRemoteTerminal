FROM node:latest

ENV PROJECT_ROOT /opt/app

RUN apt-get update \
    && apt install tree \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g pm2 \
    && npm install -g socket.io \
    && npm install -g log-to-file

RUN mkdir -p /tmp/app

COPY package.json /tmp/app/package.json

RUN cd /tmp/app/ && npm install --silent

WORKDIR $PROJECT_ROOT

COPY bin /opt/bin
COPY public /opt/app/public
COPY ecosystem.config.js /opt/app/ecosystem.config.js
COPY package.json /opt/app/package.json
COPY server.cer /opt/app/server.cer
COPY server.js /opt/app/server.js
COPY server.key /opt/app/server.key

CMD ["/opt/bin/start.sh"]