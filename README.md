# Exomo terminal

## Sources of inspiration

- Structure inspired from <https://www.activelamp.com/blog/devops/docker-and-development-environments-setting-up-for-nodejs-on-osx>
- First tutorial about sockets : <https://socket.io/get-started/chat>
- Web Bluetooth Terminal : <https://github.com/loginov-rocks/Web-Bluetooth-Terminal>

## Start

- docker-sync-stack start

## Stop and clean

- Ctrl+C
- docker-sync-stack clean
- docker image rm exomoterminal_server-app

## Restart

- Ctrl+C
- docker-sync-stack clean && docker image rm exomoterminal_server-app && docker-sync-stack start

## Usage

- open one or more browsers to <http://localhost:3000/>
- each brower can chat with all others
- anything will be log in server-logs/app.log file
