FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

# source and destination directories for the copy command
COPY . .

ARG NEXT_PUBLIC_API_URL 
# Set the environment variable for the API URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]