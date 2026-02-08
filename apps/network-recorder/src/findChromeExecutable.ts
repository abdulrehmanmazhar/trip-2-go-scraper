// @ts-nocheck

import { execSync } from 'node:child_process';
import fs from 'node:fs';

export function findChromeExecutable() {
  const platform = process.platform;

  if (platform === 'linux') {
    const candidates = [
      'google-chrome',
      'google-chrome-stable',
      'chromium',
      'chromium-browser',
    ];

    for (const bin of candidates) {
      try {
        const path = execSync(`which ${bin}`, { stdio: 'pipe' })
          .toString()
          .trim();
        if (fs.existsSync(path)) return path;
      } catch(err) {
      }
    }
  }

  if (platform === 'darwin') {
    const macPath =
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    if (fs.existsSync(macPath)) return macPath;
  }

  if (platform === 'win32') {
    const prefixes = [
      process.env.PROGRAMFILES,
      process.env['PROGRAMFILES(X86)'],
      process.env.LOCALAPPDATA,
    ];

    for (const prefix of prefixes) {
      if (!prefix) continue;
      const chromePath = `${prefix}\\Google\\Chrome\\Application\\chrome.exe`;
      if (fs.existsSync(chromePath)) return chromePath;
    }
  }

  throw new Error('❌ Google Chrome not found on this machine');
}
