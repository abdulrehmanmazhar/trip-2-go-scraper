#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

DEFAULT_SYSTEM_PREFIX="/opt/figgo-bot"
USER_PREFIX="${XDG_DATA_HOME:-$HOME/.local/share}/figgo-bot"

usage() {
    echo "Usage: bash scripts/installer.sh [--user | --system]"
    echo "Env:  FIGGO_BOT_PREFIX=/path"
}

INSTALL_MODE="auto"
while [[ $# -gt 0 ]]; do
    case "$1" in
    --user) INSTALL_MODE="user"; shift ;;
    --system) INSTALL_MODE="system"; shift ;;
    -h | --help) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage >&2; exit 1 ;;
    esac
done

if [[ -n "${FIGGO_BOT_PREFIX:-}" ]]; then
    DEST="${FIGGO_BOT_PREFIX%/}"
elif [[ "$INSTALL_MODE" == "user" ]]; then
    DEST="$USER_PREFIX"
elif [[ "$INSTALL_MODE" == "system" ]]; then
    DEST="$DEFAULT_SYSTEM_PREFIX"
else
    if [[ "$(id -u)" -eq 0 ]]; then DEST="$DEFAULT_SYSTEM_PREFIX"; else DEST="$USER_PREFIX"; fi
fi

[[ -f "$SOURCE_ROOT/package.json" ]] || { echo "installer: missing package.json" >&2; exit 1; }
[[ -f "$SOURCE_ROOT/dist/index.js" ]] || { echo "installer: run npm run dist first" >&2; exit 1; }

PKG_VERSION="$(node -p "require('./package.json').version" 2>/dev/null || echo "0.0.0")"
VERSION_DIR="$DEST/versions/$PKG_VERSION"

echo "Installing Figgo Bot $PKG_VERSION to $DEST"

mkdir -p "$DEST/current" "$DEST/versions" "$DEST/shared/logs" "$DEST/shared/cache" "$DEST/shared/sessions"
mkdir -p "$DEST/shared/temp/updates" "$DEST/shared/temp/staging" "$VERSION_DIR"

for item in dist node_modules runtime workflows package.json tsconfig.json scripts updater; do
    [[ -e "$SOURCE_ROOT/$item" ]] || continue
    cp -a "$SOURCE_ROOT/$item" "$VERSION_DIR/"
done

echo "$PKG_VERSION" >"$DEST/current/version.txt"
ln -sfn "$VERSION_DIR" "$DEST/current/app" 2>/dev/null || true

BIN_DIR="$HOME/.local/bin"
[[ "$(id -u)" -eq 0 && "$INSTALL_MODE" != "user" ]] && BIN_DIR="/usr/local/bin"
mkdir -p "$BIN_DIR"
LAUNCHER="$DEST/current/app/scripts/figgo-bot.sh"
chmod +x "$LAUNCHER" 2>/dev/null || true
[[ -f "$VERSION_DIR/runtime/linux/node/bin/node" ]] && chmod +x "$VERSION_DIR/runtime/linux/node/bin/node" || true
[[ -f "$VERSION_DIR/runtime/linux/node/bin/npm" ]] && chmod +x "$VERSION_DIR/runtime/linux/node/bin/npm" || true
ln -sfn "$LAUNCHER" "$BIN_DIR/figgo-bot"

echo "Done. Active version: $PKG_VERSION"
echo "Ensure $BIN_DIR is on PATH. Try: figgo-bot --help"
