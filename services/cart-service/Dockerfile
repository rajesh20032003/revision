#single build stage

# FROM node:20-alpine
# WORKDIR /app
# COPY package.json .
# RUN npm install --omit=dev
# COPY index.js .
# ENV PORT=8080
# EXPOSE 8080
# CMD ["node", "index.js"]

#multi build stage
FROM node:26-alpine as builder 
WORKDIR /app 
COPY package.json . 
RUN npm install --omit=dev
COPY index.js . 


FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app .
ENV PORT=8080
EXPOSE 8080
CMD ["node", "index.js"]
