FROM node:18-alpine

# Instalar OpenSSL e outras dependências necessárias para o Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar TODAS as dependências (incluindo devDependencies para Prisma CLI)
RUN npm ci

# Gerar Prisma Client
RUN npx prisma generate

# Copiar código
COPY . .

# Remover devDependencies para reduzir tamanho (opcional)
RUN npm prune --production

# Expor porta
EXPOSE 3001

# Comando de start: usar script de baseline automático antes de subir o servidor
# O script detecta se precisa fazer baseline e aplica migrações automaticamente
CMD ["sh", "-c", "npm run start:prod"]
