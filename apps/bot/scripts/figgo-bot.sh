#!/usr/bin/env bash
set -euo pipefail

# Directory layout: <install-root>/scripts/figgo-bot.sh → <install-root>/dist/index.js
# Runtimes match upstream Node layout: runtime/<platform>/node/bin/node (+ npm in same bin/)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BOT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENTRY="$BOT_ROOT/dist/index.js"

if [[ ! -f "$ENTRY" ]]; then
    echo "figgo-bot: missing $ENTRY — build with npm run dist first." >&2
    exit 1
fi

os="$(uname -s)"
NODE_BIN=""

case "$os" in
Linux)
    if [[ -x "$BOT_ROOT/runtime/linux/node/bin/node" ]]; then
        NODE_BIN="$BOT_ROOT/runtime/linux/node/bin/node"
    fi
    ;;
Darwin)
    if [[ -x "$BOT_ROOT/runtime/darwin/node/bin/node" ]]; then
        NODE_BIN="$BOT_ROOT/runtime/darwin/node/bin/node"
    fi
    ;;
MINGW* | MSYS* | CYGWIN*)
    if [[ -x "$BOT_ROOT/runtime/win-x64/node/node.exe" ]]; then
        NODE_BIN="$BOT_ROOT/runtime/win-x64/node/node.exe"
    fi
    ;;
esac

if [[ -z "$NODE_BIN" ]]; then
    if command -v node >/dev/null 2>&1; then
        NODE_BIN="$(command -v node)"
    else
        echo "figgo-bot: no bundled Node for this OS and no 'node' on PATH." >&2
        exit 1
    fi
fi

case "$os" in
Linux)
    export PATH="$BOT_ROOT/runtime/linux/node/bin:$PATH"
    ;;
Darwin)
    if [[ -d "$BOT_ROOT/runtime/darwin/node/bin" ]]; then
        export PATH="$BOT_ROOT/runtime/darwin/node/bin:$PATH"
    fi
    ;;
MINGW* | MSYS* | CYGWIN*)
    export PATH="$BOT_ROOT/runtime/win-x64/node:$PATH"
    ;;
esac

exec "$NODE_BIN" "$ENTRY" "$@"
