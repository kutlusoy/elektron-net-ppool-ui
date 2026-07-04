#!/bin/sh

js_escape() {
    printf '%s' "$1" | sed 's#\\#\\\\#g; s#"#\\"#g'
}

write_runtime_config() {
    config="{"
    separator=""

    if [ "${PUBLIC_POOL_API_URL+x}" ]; then
        config="${config}${separator}\"API_URL\":\"$(js_escape "$PUBLIC_POOL_API_URL")\""
        separator=","
    fi

    if [ "${PUBLIC_POOL_STRATUM_URL+x}" ]; then
        config="${config}${separator}\"STRATUM_URL\":\"$(js_escape "$PUBLIC_POOL_STRATUM_URL")\""
        separator=","
    fi

    if [ "${PUBLIC_POOL_BLOCK_EXPLORER_TX_URL+x}" ]; then
        config="${config}${separator}\"BLOCK_EXPLORER_TX_URL\":\"$(js_escape "$PUBLIC_POOL_BLOCK_EXPLORER_TX_URL")\""
        separator=","
    fi

    if [ "${PUBLIC_POOL_SOLO_POOL_URL+x}" ]; then
        config="${config}${separator}\"SOLO_POOL_URL\":\"$(js_escape "$PUBLIC_POOL_SOLO_POOL_URL")\""
    fi

    config="${config}}"

    cat > /var/www/html/assets/runtime-config.js <<EOF
window.__PUBLIC_POOL_CONFIG__ = ${config};
EOF
}

# Generates /etc/Caddyfile from scratch every start (unless the user bind-
# mounted their own, see below). Building it with a heredoc instead of the
# old sed-templated Caddyfile.tpl is what makes the API_UPSTREAM block below
# conditional without fragile multi-line sed substitution.
write_caddyfile() {
    cat > /etc/Caddyfile <<EOF
:80 {
    root * /var/www/html
EOF

    # Complete-package mode: reverse-proxy /api/* to the backend container
    # over the Docker network (e.g. API_UPSTREAM=elektron-ppool:3334), so the
    # browser only ever talks to this one origin -- no CORS, no need to know
    # the backend's host/IP from outside. Leave unset (the old behaviour) to
    # keep calling an absolute PUBLIC_POOL_API_URL instead, e.g. for a
    # frontend and backend hosted on entirely separate machines/domains.
    # Deliberately "handle" (not "handle_path"): the backend's own routes are
    # already prefixed with /api (NestJS app.setGlobalPrefix('api')), and
    # handle_path would strip that prefix before forwarding, causing every
    # proxied request to 404 against the backend.
    if [ -n "$API_UPSTREAM" ]; then
        cat >> /etc/Caddyfile <<EOF

    handle /api/* {
        reverse_proxy ${API_UPSTREAM}
    }
EOF
    fi

    cat >> /etc/Caddyfile <<EOF

    file_server

    log {
        output stdout
        format ${LOGFORMAT:-json}
        level ${LOGLEVEL:-INFO}
    }
}
EOF
}

if [ -e "/etc/Caddyfile" ]; then
    echo "Using bind-mounted /etc/Caddyfile as-is"
else
    write_caddyfile
fi

write_runtime_config

echo "Starting UI on port 80"
echo "Logs output: ${LOGLEVEL:-INFO} (${LOGFORMAT:-json})"
if [ -n "$API_UPSTREAM" ]; then
    echo "Proxying /api/* to ${API_UPSTREAM}"
fi

exec caddy run --config /etc/Caddyfile
