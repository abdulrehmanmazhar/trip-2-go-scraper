#!/usr/bin/env bash
set -euo pipefail

# Install the extracted bot tree globally: copy to a fixed prefix and symlink figgo-bot into PATH.
# Run from the bot root (recommended):   bash scripts/installer.sh
# Or:                                      bash path/to/bot/scripts/installer.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

DEFAULT_SYSTEM_PREFIX="/opt/figgo-bot"
USER_PREFIX="${XDG_DATA_HOME:-$HOME/.local/share}/figgo-bot"

usage() {
    echo "Usage: sudo bash scripts/installer.sh           # install to $DEFAULT_SYSTEM_PREFIX + /usr/local/bin/figgo-bot"
    echo "       bash scripts/installer.sh --user        # install to $USER_PREFIX + ~/.local/bin/figgo-bot"
    echo "Env:   FIGGO_BOT_PREFIX=/custom/path           # override install directory"
}

INSTALL_MODE="auto"
while [[ $# -gt 0 ]]; do
    case "$1" in
    --user)
        INSTALL_MODE="user"
        shift
        ;;
    --system)
        INSTALL_MODE="system"
        shift
        ;;
    -h | --help)
        usage
        exit 0
        ;;
    *)
        echo "Unknown option: $1" >&2
        usage >&2
        exit 1
        ;;
    esac
done

if [[ -n "${FIGGO_BOT_PREFIX:-}" ]]; then
    DEST="${FIGGO_BOT_PREFIX%/}"
elif [[ "$INSTALL_MODE" == "user" ]]; then
    DEST="$USER_PREFIX"
elif [[ "$INSTALL_MODE" == "system" ]]; then
    DEST="$DEFAULT_SYSTEM_PREFIX"
else
    # auto: system prefix if root, else user
    if [[ "$(id -u)" -eq 0 ]]; then
        DEST="$DEFAULT_SYSTEM_PREFIX"
    else
        DEST="$USER_PREFIX"
    fi
fi

if [[ ! -f "$SOURCE_ROOT/package.json" ]]; then
    echo "installer: expected package.json under $SOURCE_ROOT" >&2
    exit 1
fi

if [[ ! -f "$SOURCE_ROOT/dist/index.js" ]]; then
    echo "installer: missing dist/index.js — run 'npm run dist' in the bot folder before installing." >&2
    exit 1
fi

BIN_LINK_NAME="figgo-bot"
# Root system installs use /usr/local/bin; user installs use ~/.local/bin (works for non-root and sudo … --user).
if [[ "$(id -u)" -eq 0 ]] && [[ "$INSTALL_MODE" != "user" ]]; then
    BIN_DIR="/usr/local/bin"
else
    BIN_DIR="${HOME}/.local/bin"
fi

mkdir -p "$DEST"
echo "Copying $SOURCE_ROOT → $DEST"
# Preserve permissions (bundled node binaries must stay executable)
cp -a "$SOURCE_ROOT"/. "$DEST"/

chmod +x "$DEST/scripts/figgo-bot.sh" 2>/dev/null || true
[[ -f "$DEST/runtime/linux/node/bin/node" ]] && chmod +x "$DEST/runtime/linux/node/bin/node" || true
[[ -f "$DEST/runtime/linux/node/bin/npm" ]] && chmod +x "$DEST/runtime/linux/node/bin/npm" || true

mkdir -p "$BIN_DIR"
LINK_PATH="$BIN_DIR/$BIN_LINK_NAME"
TARGET_SH="$DEST/scripts/figgo-bot.sh"

if [[ -L "$LINK_PATH" ]] || [[ ! -e "$LINK_PATH" ]]; then
    ln -sfn "$TARGET_SH" "$LINK_PATH"
    echo "Linked $LINK_PATH → $TARGET_SH"
else
    echo "installer: $LINK_PATH exists and is not a symlink; remove it or pick another BIN dir." >&2
    exit 1
fi

echo "Done. Ensure '$BIN_DIR' is on your PATH (e.g. export PATH=\"\$HOME/.local/bin:\$PATH\")."
echo "Try: $BIN_LINK_NAME --help"
