FROM node:20-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev vips-dev git > /dev/null 2>&1
WORKDIR /opt/

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --production

FROM base AS builder
WORKDIR /opt/
COPY --from=deps /opt/node_modules ./node_modules
COPY --from=deps /opt/package.json /opt/pnpm-lock.yaml ./
COPY . ./app

WORKDIR /opt/app
ENV NODE_ENV=production
ENV PATH=/opt/node_modules/.bin:$PATH
RUN pnpm build

# Production image, copy all the files and run strapi
FROM base AS runner
WORKDIR /opt/app

ENV NODE_ENV=production
ENV PATH=/opt/node_modules/.bin:$PATH

RUN apk add --no-cache vips-dev

COPY --from=deps /opt/node_modules ../node_modules
COPY --from=builder /opt/app ./

RUN chown -R node:node /opt/app
USER node
EXPOSE 1337

CMD ["pnpm", "start"]
