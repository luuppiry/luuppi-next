FROM node:24.13-alpine3.22 AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev vips-dev git > /dev/null 2>&1
WORKDIR /opt/app

COPY . .

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /opt/app
COPY --from=deps /opt/app ./

RUN pnpm --filter luuppi-blocks build
RUN pnpm build

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm prune --prod

# Production image, copy all the files and run strapi
FROM base AS runner
WORKDIR /opt/app

ENV NODE_ENV=production
ENV PATH=/opt/app/node_modules/.bin:$PATH

# Install runtime dependencies and build tools for sharp rebuild
RUN apk add --no-cache vips-dev build-base gcc autoconf automake zlib-dev libpng-dev python3 make g++

COPY --from=builder /opt/app ./

# Rebuild sharp in the final stage for the correct Alpine Linux runtime
RUN pnpm rebuild sharp

RUN chown -R node:node /opt/app
USER node
EXPOSE 1337

CMD ["pnpm", "start"]
