FROM node:16.16.0

RUN mkdir /usr/www
WORKDIR /usr/www

RUN export NODE_ENV=production

COPY . /usr/www


# Install the dependencies
RUN npm install -y
RUN npm run build

CMD ["npm", "start"]