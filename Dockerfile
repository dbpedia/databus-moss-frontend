FROM node:18 as node
WORKDIR /usr/src/app
COPY package*.json ./
COPY . .
RUN npm install && npm install -g @angular/cli
CMD ["ng","serve","--host", "0.0.0.0", "--disable-host-check"]