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

# add application dependencies lists
COPY package.json yarn.lock /app/

# change file permissions
RUN chown development:development -R /app/

# run as non-root user
USER development

# install application dependencies
RUN yarn install


# stage 0: dependencies
# pull official base image
FROM node:18.14.2-slim as dependencies

# install system dependencies
RUN apt-get update \
    && apt-get clean \
    && useradd -ms /bin/bash dependencies

# set working directory
WORKDIR /app/

# add application dependencies lists
COPY package.json yarn.lock /app/

# change file permissions
RUN chown dependencies:dependencies -R /app/

# run as non-root user
USER dependencies

# install application dependencies
RUN yarn install --frozen-lockfile


# stage 1: builder
FROM node:18.14.2-slim as builder

# install system dependencies
RUN apt-get update \
    && apt-get clean \
    && useradd -ms /bin/bash builder

# set environment variables
ENV NODE_ENV="production"

# set working directory
WORKDIR /app/

# add modules and application
COPY --from=dependencies /app/node_modules/ /app/node_modules/
COPY ./ /app/

# change file permissions
RUN chown builder:builder -R /app/

# run as non-root user
USER builder

# build application
RUN yarn build


# stage 2: production
FROM node:18.14.2-slim as production

# install system dependencies
RUN apt-get update \
    && apt-get clean \
    && useradd -ms /bin/bash invictus

# set environment variables
ENV NODE_ENV="production"\
    NEXT_TELEMETRY_DISABLED=1

# set working directory
WORKDIR /app/

# add application
COPY --from=builder /app/next.config.js /app/
COPY --from=builder /app/public/ /app/public/
COPY --from=builder /app/package.json /app/yarn.lock /app/
COPY --from=builder /app/.next/ /app/.next/

# change file permissions
RUN chown invictus:invictus -R /app/

# run as non-root user
USER invictus

# install production application dependencies
RUN yarn install --production --frozen-lockfile --ignore-scripts

# expose port
EXPOSE 3000

# run application
CMD ["yarn", "start"]
