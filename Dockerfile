# stage alpha: development
# pull official base image
FROM node:18.14.2-slim as development

# install system dependencies
RUN apt-get update \
    && apt-get clean \
    && useradd -ms /bin/bash development

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
FROM node:18.14.2-slim as dependencies

# install system dependencies
RUN apt-get update \
    && apt-get clean \
    && useradd -ms /bin/bash dependencies

# set working directory
WORKDIR /app/

# change directory permissions
RUN chown dependencies:dependencies /app/

# run as non-root user
USER dependencies

# add dependencies lists
COPY --chown=dependencies:dependencies package.json yarn.lock /app/

# install application dependencies
RUN yarn install --frozen-lockfile


# stage 1: builder
FROM node:18.14.2-slim as builder

# install system dependencies
RUN apt-get update \
    && apt-get clean \
    && useradd -ms /bin/bash builder

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

# build application, install production application dependencies, and cleanup
RUN yarn build \
    && yarn install --production --frozen-lockfile --ignore-scripts \
    && yarn autoclean --init \
    && yarn autoclean --force \
    && yarn cache clean


# stage 2: production
FROM node:18.14.2-slim as production

# install system dependencies
RUN apt-get update \
    && apt-get clean \
    && useradd -ms /bin/bash invictus

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
COPY --chown=invictus:invictus --from=builder /app/package.json /app/yarn.lock /app/
COPY --chown=invictus:invictus --from=builder /app/node_modules/ /app/node_modules/
COPY --chown=invictus:invictus --from=builder /app/public/ /app/public/
COPY --chown=invictus:invictus --from=builder /app/.next/ /app/.next/

# expose port
EXPOSE 3000

# run application
CMD ["yarn", "start"]
