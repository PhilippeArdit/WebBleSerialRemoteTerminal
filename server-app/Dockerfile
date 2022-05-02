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

CMD ["/opt/bin/start.sh"]