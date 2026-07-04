############################
# Docker build environment #
############################

FROM node:lts-bookworm-slim AS build

# Upgrade all packages and install dependencies
RUN apt-get update \
    && apt-get upgrade -y
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        python3 \
        build-essential \
    && apt clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

WORKDIR /build

COPY . .

# Build Public Pool UI using NPM
RUN npm i && npm run build

############################
# Docker final environment #
############################

FROM caddy:alpine AS final

EXPOSE 80
WORKDIR /var/www/html

COPY --from=build /build/dist/elektron-net-pool-ui .
COPY docker/entrypoint.sh /entrypoint.sh

# Strip any CRLF line endings before they can break the shebang/heredocs --
# checking this repo out on Windows (git's default core.autocrlf=true)
# rewrites entrypoint.sh with \r\n, which COPY then bakes in byte-for-byte,
# and /bin/sh chokes on the stray \r with cryptic "not found"/"unexpected
# end of file" errors. Doing this in the image build makes it work
# regardless of the host's git line-ending config.
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh

CMD ["/bin/sh", "/entrypoint.sh"]
