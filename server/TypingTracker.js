const { GlobalKeyboardListener } = require('node-global-key-listener');
const { processTypingIncrement } = require('./DashboardServer');

let sharedUserId = null;

function setUser(id) {
  sharedUserId = id;
  console.log(`[TypingTracker] userId set to: ${sharedUserId}`);
}

function startTracking() {
  const listener = new GlobalKeyboardListener();

  listener.addListener(async (e) => {
    console.log('입력 감지:', e.name, e.state, 'userId:', sharedUserId);

    if (
      e.state === 'DOWN' &&
      sharedUserId &&
      isAllowedKey(e.name)
    ) {
      try {
        await processTypingIncrement(sharedUserId);
        console.log('타수 증가됨:', e.name);
      } catch (err) {
        console.error('입력 저장 실패:', err);
      }
    }
  });

  console.log('[TypingTracker] 키보드 입력 감지 시작됨');
}

function isAllowedKey(keyName) {
  if (!keyName) return false;
  if (keyName.startsWith('MOUSE')) return false;

  const ignored = [
    'LEFT SHIFT', 'RIGHT SHIFT',
    'LEFT CTRL', 'RIGHT CTRL',
    'LEFT ALT', 'RIGHT ALT',
    'LEFT META', 'RIGHT META',
    'ENTER', 'RETURN',
    'BACKSPACE', 'TAB',
    'ESCAPE', 'CAPS LOCK',
    'INSERT', 'DELETE',
    'HOME', 'END',
    'PAGE UP', 'PAGE DOWN',
    'PRINT SCREEN', 'SCROLL LOCK', 'PAUSE'
  ];
  if (ignored.includes(keyName.toUpperCase())) return false;
  if (/^F[1-9]$|^F1[0-2]$/.test(keyName.toUpperCase())) return false;
  if (keyName.toUpperCase().startsWith('ARROW')) return false;

  return true;
}

module.exports = {
  startTracking,
  setUser,
};
