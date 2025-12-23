FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos
COPY package*.json ./
RUN npm ci

COPY . .

# Dar permissão de execução aos binários (depois do COPY)
RUN chmod +x node_modules/.bin/*

# Build
RUN npm run build

# Produção
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package*.json ./

RUN npm ci --only=production

EXPOSE 3000

ENV NODE_ENV=production
ENV NITRO_PORT=3000
ENV NITRO_HOST=0.0.0.0

CMD ["node", ".output/server/index.mjs"]
