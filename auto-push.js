/**
 * auto-push.js
 * Automatically watches project files and triggers git add, commit, and push
 * to https://github.com/sanjayalok2222-pixel/isai when changes occur.
 */
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const WATCH_DIRS = [
  path.join(__dirname, 'data'),
  path.join(__dirname, 'public')
];

let debounceTimer = null;
const DEBOUNCE_DELAY = 4000; // 4 seconds after last change

function runGitPush(changedFile) {
  const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  const basename = changedFile ? path.basename(changedFile) : 'files';
  const commitMsg = `Auto-sync: Updated ${basename} [${timestamp}]`;
  const cmd = `git add . && git commit -m "${commitMsg}" && git push origin main`;

  console.log(`[Auto-Push] Changes detected in ${basename}. Running Git commit & push...`);

  exec(cmd, { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
      if (stdout && stdout.includes('nothing to commit')) {
        console.log('[Auto-Push] Nothing to commit, working tree clean.');
      } else {
        console.warn('[Auto-Push] Git Warning/Error:', error.message);
      }
    } else {
      console.log('[Auto-Push] Successfully pushed to GitHub:\n', stdout.trim());
    }
  });
}

function schedulePush(filename) {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    runGitPush(filename);
  }, DEBOUNCE_DELAY);
}

console.log('=======================================================');
console.log('  ISAI AUTO-PUSH WATCHER ACTIVE');
console.log('  Monitoring changes in: data/ & public/');
console.log('  Remote: https://github.com/sanjayalok2222-pixel/isai');
console.log('=======================================================');

WATCH_DIRS.forEach((dir) => {
  if (fs.existsSync(dir)) {
    fs.watch(dir, { recursive: true }, (eventType, filename) => {
      if (filename && !filename.includes('.git')) {
        console.log(`[Watcher] ${eventType}: ${filename}`);
        schedulePush(filename);
      }
    });
  }
});
