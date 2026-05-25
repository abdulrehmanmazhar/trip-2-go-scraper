#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

resolve_install_root() {
    local dir="$SCRIPT_DIR"
    while [[ -n "$dir" && "$dir" != "/" ]]; do
        if [[ -f "$dir/current/version.txt" ]]; then
            echo "$dir"
            return
        fi
        dir="$(dirname "$dir")"
    done
    cd "$SCRIPT_DIR/.." && pwd
}

INSTALL_ROOT="$(resolve_install_root)"
VERSION_FILE="$INSTALL_ROOT/current/version.txt"
VERSION=""
APP_ROOT=""

if [[ -f "$VERSION_FILE" ]]; then
    VERSION="$(tr -d '[:space:]' < "$VERSION_FILE")"
fi

if [[ -z "$VERSION" ]]; then
    if [[ -f "$INSTALL_ROOT/dist/index.js" ]]; then
        APP_ROOT="$INSTALL_ROOT"
    else
        echo "figgo-bot: no active version in current/version.txt and no legacy dist/index.js" >&2
        exit 1
    fi
else
    APP_ROOT="$INSTALL_ROOT/versions/$VERSION"
    if [[ -f "$INSTALL_ROOT/current/app/dist/index.js" ]]; then
        APP_ROOT="$INSTALL_ROOT/current/app"
    fi
fi

ENTRY="$APP_ROOT/dist/index.js"
if [[ ! -f "$ENTRY" ]]; then
    echo "figgo-bot: missing $ENTRY for version ${VERSION:-legacy}" >&2
    exit 1
fi

export FIGGO_INSTALL_ROOT="$INSTALL_ROOT"
export FIGGO_ACTIVE_VERSION="${VERSION:-legacy}"

os="$(uname -s)"
NODE_BIN=""

case "$os" in
Linux)
    [[ -x "$APP_ROOT/runtime/linux/node/bin/node" ]] && NODE_BIN="$APP_ROOT/runtime/linux/node/bin/node"
    ;;
Darwin)
    [[ -x "$APP_ROOT/runtime/darwin/node/bin/node" ]] && NODE_BIN="$APP_ROOT/runtime/darwin/node/bin/node"
    ;;
MINGW* | MSYS* | CYGWIN*)
    [[ -x "$APP_ROOT/runtime/win-x64/node/node.exe" ]] && NODE_BIN="$APP_ROOT/runtime/win-x64/node/node.exe"
    ;;
esac

if [[ -z "$NODE_BIN" ]]; then
    command -v node >/dev/null 2>&1 || { echo "figgo-bot: no bundled Node and no node on PATH." >&2; exit 1; }
    NODE_BIN="$(command -v node)"
fi

exec "$NODE_BIN" "$ENTRY" "$@"
