FROM node:24.13-alpine3.22 AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev vips-dev git > /dev/null 2>&1
WORKDIR /opt/

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
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

# Install runtime dependencies AND build tools for sharp rebuild
RUN apk add --no-cache vips-dev build-base gcc autoconf automake zlib-dev libpng-dev python3 make g++

COPY --from=deps /opt/node_modules ../node_modules
COPY --from=deps /opt/package.json /opt/pnpm-lock.yaml /opt/pnpm-workspace.yaml  ../ 
COPY --from=builder /opt/app ./

# Rebuild sharp in the final stage for the correct Alpine Linux runtime
RUN cd /opt && pnpm rebuild sharp

RUN chown -R node:node /opt/app
USER node
EXPOSE 1337

CMD ["pnpm", "start"]
