# stage alpha: development
# pull official base image
FROM node:22-slim AS development

# install system dependencies
RUN apt-get update \
    && apt-get clean \
    && useradd -ms /bin/bash development \
    && corepack enable \
    && corepack prepare yarn@4.9.2 --activate

# set environment variables
ENV NODE_ENV="development"

# set working directory
WORKDIR /app/

# change directory permissions
RUN chown development:development /app/

# run as non-root user
USER development

# add dependencies list and application
COPY --chown=development:development package.json yarn.lock /app/
COPY --chown=development:development ./ /app/

# install application dependencies
RUN yarn install

# run application
CMD ["yarn", "dev"]


# stage 0: dependencies
# pull official base image
FROM node:22-slim AS dependencies

# install system dependencies
RUN apt-get update \
    && apt-get clean \
    && useradd -ms /bin/bash dependencies \
    && corepack enable \
    && corepack prepare yarn@4.9.2 --activate

# set working directory
WORKDIR /app/

# change directory permissions
RUN chown dependencies:dependencies /app/

# run as non-root user
USER dependencies

# add dependencies lists
COPY --chown=dependencies:dependencies package.json yarn.lock .yarnrc.yml /app/

# install application dependencies
RUN yarn install --immutable


# stage 1: builder
FROM node:22-slim AS builder

# install system dependencies
RUN apt-get update \
    && apt-get clean \
    && useradd -ms /bin/bash builder \
    && corepack enable \
    && corepack prepare yarn@4.9.2 --activate

# set environment variables
ENV NODE_ENV="production" \
    NEXT_TELEMETRY_DISABLED=1

# set working directory
WORKDIR /app/

# change directory permissions
RUN chown builder:builder /app/

# run as non-root user
USER builder

# add modules and application
COPY --chown=builder:builder --from=dependencies /app/node_modules/ /app/node_modules/
COPY --chown=builder:builder ./ /app/

# build application, prune devDependencies down to production-only, and cleanup
RUN yarn build \
    && yarn workspaces focus --production \
    && yarn cache clean


# stage 2: production
FROM node:22-slim AS production

# install system dependencies
RUN apt-get update \
    && apt-get clean \
    && useradd -ms /bin/bash invictus \
    && corepack enable \
    && corepack prepare yarn@4.9.2 --activate

# set environment variables
ENV NODE_ENV="production" \
    NEXT_TELEMETRY_DISABLED=1

# set working directory
WORKDIR /app/

# change directory permissions
RUN chown invictus:invictus /app/

# run as non-root user
USER invictus

# add configurations, dependencies lists, modules, and application
COPY --chown=invictus:invictus --from=builder /app/next.config.js /app/
COPY --chown=invictus:invictus --from=builder /app/package.json /app/yarn.lock /app/.yarnrc.yml /app/
COPY --chown=invictus:invictus --from=builder /app/node_modules/ /app/node_modules/
COPY --chown=invictus:invictus --from=builder /app/public/ /app/public/
COPY --chown=invictus:invictus --from=builder /app/.next/ /app/.next/

# expose port
EXPOSE 3000

# report container health via the content-independent health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# run application
CMD ["yarn", "start"]
