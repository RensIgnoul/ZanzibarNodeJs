FROM node:18
WORKDIR /app
COPY routes/ *.js *.html *.json /app/
RUN npm install
EXPOSE 5000
CMD node app.js