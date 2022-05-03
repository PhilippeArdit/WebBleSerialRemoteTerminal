# Exomo terminal

## Sources of inspiration

- Structure inspired from <https://www.activelamp.com/blog/devops/docker-and-development-environments-setting-up-for-nodejs-on-osx>
- First tutorial about sockets : <https://socket.io/get-started/chat>
- Web Bluetooth Terminal : <https://github.com/loginov-rocks/Web-Bluetooth-Terminal>
- bluetooth-terminal : <https://github.com/loginov-rocks/bluetooth-terminal>
- Web Bluetooth API : <https://webbluetoothcg.github.io/web-bluetooth/>

## HTTPS (self signed certificat for <https://localhost:3000/>, ok with Chrome)

    cd server-app

    openssl genrsa -out server.key
    openssl req -new -key server.key -out csr.pem
    openssl x509 -req -days 9999 -in csr.pem -signkey server.key -out server.cer
    rm csr.pem
    -> subject=C = FR, ST = Herault, L = Mudaison, O = Exomo, CN = localhost, emailAddress = philippe@exomo.com

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
