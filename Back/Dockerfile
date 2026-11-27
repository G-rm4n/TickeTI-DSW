FROM node:24-alpine

WORKDIR /app

# Instalar pnpm globalmente (evita errores de corepack en Node 24)
RUN npm install -g pnpm

# Instalar dependencias exactas usando el lockfile
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copiar código fuente y compilar TypeScript a dist/
COPY . .
RUN pnpm build

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/app.js"]