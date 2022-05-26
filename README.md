# EXOMO terminal

## Sources of inspiration & resources

- First tutorial about sockets : <https://socket.io/get-started/chat>
- Web Bluetooth Terminal from Danila Loginov (loginov-rocks): <https://github.com/loginov-rocks/Web-Bluetooth-Terminal> and <https://github.com/loginov-rocks/bluetooth-terminal>
- Web Bluetooth API : <https://webbluetoothcg.github.io/web-bluetooth/>
- Web Serial API : <https://web.dev/serial/>
- Espruino Quick Start (Bluetooth LE) : <https://www.espruino.com/Quick+Start+BLE>
- Espruino Web IDE : <https://www.espruino.com/ide/>
- Serial Terminal : <https://googlechromelabs.github.io/serial-terminal/>

## Development environment

### Docker and Development Environments

Setting up for Node.js on MacOS : <https://www.activelamp.com/blog/devops/docker-and-development-environments-setting-up-for-nodejs-on-osx>

### Create a self signed certificat

- for <https://localhost:3000/>
- ok with Chrome
- subject=C = FR, ST = Herault, L = Mudaison, O = Exomo, CN = localhost, emailAddress = philippe@exomo.com

        cd server-app

        openssl genrsa -out server.key
        openssl req -new -key server.key -out csr.pem
        openssl x509 \
               -req \
               -days 9999 \
               -in csr.pem \
               -signkey server.key \
               -out server.cer
        rm csr.pem

### Start the server

- docker-sync-stack start

### Stop and clean the server

- Ctrl+C
- docker-sync-stack clean
- docker image rm exomoterminal_server-app

### Restart the server

- Ctrl+C
- docker-sync-stack clean && docker image rm exomoterminal_server-app && docker-sync-stack start

## Web app usage

- debug : chrome://device-log/
- open one or more browsers to <http://localhost:3000/>
- each brower can chat with all others
- anything will be log in server-logs/app.log file
