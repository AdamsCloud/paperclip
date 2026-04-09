#!/bin/sh
set -e

# Capture runtime UID/GID from environment variables, defaulting to 1000
PUID=${USER_UID:-1000}
PGID=${USER_GID:-1000}

# Adjust the node user's UID/GID if they differ from the runtime request
# and fix volume ownership only when a remap is needed
changed=0

if [ "$(id -u node)" -ne "$PUID" ]; then
    echo "Updating node UID to $PUID"
    usermod -o -u "$PUID" node
    changed=1
fi

if [ "$(id -g node)" -ne "$PGID" ]; then
    echo "Updating node GID to $PGID"
    groupmod -o -g "$PGID" node
    usermod -g "$PGID" node
    changed=1
fi

# 设置 SSH 文件权限（如果存在）
if [ -d "/root/.ssh" ]; then
    chmod 700 /root/.ssh
    if [ -f "/root/.ssh/config" ]; then
        chmod 600 /root/.ssh/config
    fi
    if [ -f "/root/.ssh/id_rsa" ]; then
        chmod 600 /root/.ssh/id_rsa
    fi
    if [ -f "/root/.ssh/id_rsa.pub" ]; then
        chmod 644 /root/.ssh/id_rsa.pub
    fi
    if [ -f "/root/.ssh/id_ed25519" ]; then
        chmod 600 /root/.ssh/id_ed25519
    fi
    if [ -f "/root/.ssh/id_ed25519.pub" ]; then
       chmod 644 /root/.ssh/id_ed25519.pub
    fi
    chown -R root:root /root/.ssh
fi



if [ "$changed" = "1" ]; then
    chown -R node:node /paperclip
fi

exec gosu node "$@"
