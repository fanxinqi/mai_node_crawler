# system & node
FROM node:12.18.0-alpine as base-env
# FROM docker.int.taou.com/node:12.18.0-alpine as base-env
RUN set -eux && sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories
RUN apk add --no-cache \
    bash \
    tzdata \
    build-base g++ cairo-dev jpeg-dev pango-dev giflib-dev \
    && mkdir -p /run/openrc \
    && touch /run/openrc/softlevel \
    && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone \
    && apk del tzdata \
    && node -v && npm -v \
    && npm config set registry https://registry.npm.taobao.org

# build base
FROM base-env as base-build-env

# 安装最新版 Chromium(100) 的包
RUN apk add --update --no-cache \
    git \
    make \
    libtool \
    autoconf \
    automake \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    pigz
# 跳过自动安装 Chromium 包. 使用上面已经安装的 Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

ENV PROXY="http://proxy-00.int.taou.com:8888" \
    TAG="proxy-00" \
    UA="" \
    SEELP="" \
    RETRY=3 \
    INSTACE=''

WORKDIR /docker/mai_node_crawler
FROM base-build-env as  apps-packages
COPY package.json  /docker/mai_node_crawler
RUN npm install --production

COPY . /docker/mai_node_crawler
EXPOSE 8086
# 动态设置代理、切换ip tag、 ua
CMD node index.js -p ${PROXY} -i ${INSTACE} -u ${UA} -s ${SEELP} -r ${RETRY}