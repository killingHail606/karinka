# Nixpacks дає лише мажорну версію Node (nodejs_22 = 22.14.0), а Nuxt 4.5
# вимагає ^22.19.0. Тому збираємо через Docker: офіційний тег node:22-alpine
# завжди тягне свіжий 22.x і питання версії закривається остаточно.

FROM node:22-alpine AS build
WORKDIR /app

# Спершу лише маніфести — щоб шар із залежностями кешувався
# і не перевстановлювався від кожної правки в компонентах.
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# У рантайм їде лише зібраний вихід: node_modules там уже не потрібні,
# Nitro запакував усе необхідне в .output.
COPY --from=build /app/.output ./.output

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
