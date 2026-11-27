FROM node:24-alpine

WORKDIR /app

RUN corepack enable

# Instala dependencias (incluye devDependencies para poder ejecutar tsc)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copia el código y compila src/ -> dist/
COPY . .
RUN pnpm build

# Define producción después del build para no omitir TypeScript al compilar
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/app.js"]