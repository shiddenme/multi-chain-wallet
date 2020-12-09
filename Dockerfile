# Version1
FROM node:12.16.0

COPY . /home/work/multi_chain_wallet
WORKDIR /home/work/multi_chain_wallet

RUN npm install --registry=https://registry.npm.taobao.org
RUN npm run build
EXPOSE 3001
CMD  npm run prod
