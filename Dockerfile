FROM node:18

WORKDIR /app

COPY package*.json ./

RUN apt-get update && apt-get install -y libcairo2-dev libjpeg-dev libgif-dev && npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
