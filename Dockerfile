FROM mhart/alpine-node:4

RUN adduser -S authy

WORKDIR /home/authy/app

COPY package.json /home/authy/app/

RUN npm install --ignore-scripts

COPY . /home/authy/app/

RUN chown -R authy /home/authy

USER authy

RUN npm run build

ENTRYPOINT ["node"]

CMD ["dist/index.js"]
