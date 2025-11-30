FROM node:20-bullseye

WORKDIR /app

# 设置架构环境变量（确保获取正确的二进制文件）
ENV WRANGLER_LOG=debug

# 安装依赖
RUN apt-get update && apt-get install -y \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# 安装 Wrangler
RUN npm install -g wrangler

# 复制包文件
COPY package*.json ./

# 安装依赖
RUN npm install

# 验证 workerd 安装
RUN ls -la node_modules/@cloudflare/ || echo "Cloudflare modules not found"
RUN find node_modules -name "*workerd*" -type f | head -5 || echo "No workerd files found"

COPY . .

EXPOSE 8787
CMD ["npm", "run", "start"]