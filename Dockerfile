# Official image of Node.js + TypeScript
FROM node:14

# Virtual (Docker based) working directory
WORKDIR /usr/src/app

# Copy of package.json + package-lock.json
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy all source files
COPY . .

# Project build
RUN npm run build

# Open App port
EXPOSE 3000

# Start App
CMD [ "npm", "start" ]