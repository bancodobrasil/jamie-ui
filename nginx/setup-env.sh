#!/bin/sh

# [1] Subs environment variables

for f in /usr/share/nginx/html/*.js; do
    envsubst "`printf '${%s} ' $(sh -c "env|cut -d'=' -f1")`" < "$f" > "${f}.temp"
    cp -f "${f}.temp" "$f"
done

