FROM node:8.11.4
ENV PORT 5000
USER root
LABEL author="César Delgado" maintainer="cesar.delgado.arcos@gmail.com"

COPY ./ .
RUN npm install

CMD ["node", "server.js"]