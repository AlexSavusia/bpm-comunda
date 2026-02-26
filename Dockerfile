# =========================
# 1. Build stage
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

# Устанавливаем зависимости
COPY package.json package-lock.json* ./
RUN npm install

# Копируем исходники
COPY . .

# Сборка проекта
RUN npm run build


# =========================
# 2. Runtime stage (nginx)
# =========================
FROM nginx:1.27-alpine

# Удаляем дефолтный конфиг
RUN rm /etc/nginx/conf.d/default.conf

# Кладем свой nginx конфиг
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Копируем билд из предыдущего этапа
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
