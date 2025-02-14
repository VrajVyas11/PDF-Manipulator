FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt update && apt install -y \
    libfontconfig1 libcairo2 libjpeg-turbo8 wget curl \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt install -y nodejs

RUN wget -O pdf2htmlEX.deb https://github.com/pdf2htmlEX/pdf2htmlEX/releases/download/v0.18.8.rc1/pdf2htmlEX-0.18.8.rc1-master-20200630-Ubuntu-bionic-x86_64.deb

RUN dpkg -i ./pdf2htmlEX.deb || apt install -f -y
RUN rm pdf2htmlEX.deb
RUN pdf2htmlEX -v

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --prefer-offline --cache /root/.npm

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
