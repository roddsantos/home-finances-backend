# Base image
FROM node:18

WORKDIR /home-finances-backend
COPY package*.json ./
RUN npm install

COPY . .
CMD npm start 



# FROM node:alpine
 
# WORKDIR /user/src/app
 
# COPY package*.json ./
 
# # RUN npm install
# # RUN npm config set unsafe-perm true
# RUN npm install

# RUN mkdir node_modules/.cache && chmod -R 777 node_modules/.cache

# COPY . .
 
# RUN chown -R node /app/node_modules
# # RUN npm run build
 
# USER node
 
# CMD ["npm", "start"]