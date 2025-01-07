FROM node:20-slim

# Set the working directory in the docker image
WORKDIR /usr/src/app

# Copy package.json and package-lock.json before other files
# Utilize Docker cache to save re-installing dependencies if unchanged
COPY package*.json ./

RUN npm cache clean --force

# Install project dependencies
RUN npm install

# Copy local code to the container image
COPY . ./

# Compile TypeScript
RUN npm run build

EXPOSE 3000

# Specify the command to run on container start
CMD [ "npm", "start" ]
