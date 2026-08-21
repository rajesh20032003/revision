#node application 

FROM node:22-alpine as base 
WORKDIR /app 
COPY package*.json . 
RUN npm ci 
COPY . . 
RUN npm run build 
RUN npm prune --omit=dev 

#final image 

FROM node:22-alpine as final 
WORKDIR /app
RUN addgroup -G appgroup && adduser -S appuser -G appgroup 
COPY --from=base --chown=appuser:appgroup /app/node_modules /node_modules
COPY --from=base --chown=appuser:appgroup /app/dist ./dist 
COPY --from=base --chown=appuser:appgroup /app/package*.json .
USER appuser
EXPOSE 3000
CMD ["node", "dist/main.js"]



#PYTHON APPLICATION 

FROM python:3.12-alpine as base 
WORKDIR /app
COPY requirements.txt .
RUN python -m venv /opt/venv 
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir -r requirements.txt
COPY . . 

FROM python:3.12-alpine as final
WORKDIR /app
RUN addgroup -G appgroup && adduser -S appuser -G appgroup
COPY --from=base --chown=appuser:appgroup /opt/venv /opt/venv
COPY --from=base --chown=appuser:appgroup /app .
USER appuser
EXPOSE 8000
CMD ["python", "main.py"]
