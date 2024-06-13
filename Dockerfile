FROM node
ENV DOCKERVERSION=26.1.4
COPY . /src
WORKDIR '/src'
CMD ["/bin/bash", "-c", "npm i ts-node typescript; npm install; npm start;"]
#CMD ["node", "./index.js"]