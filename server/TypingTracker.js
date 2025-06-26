const { GlobalKeyboardListener } = require('node-global-key-listener');
// 전역 키보드 이벤트 감지하는 모듈
// 전체 입력을 추적할 때 사용

const { processTypingIncrement } = require('./DashboardServer');
// 타이핑 수 증가 처리 함수 (유저의 타이핑 기록을 DB에 반영하는 로직)을 불러옴

let sharedUserId = null; 
// 현재 로그인한 유저 ID를 저장
// 타이핑이 발생할 때 유저 ID로 타수 증가 적용


// 외부에서 userId를 설정할 수 있게 하는 함수
function setUser(id) {
  sharedUserId = id;
  console.log(`[TypingTracker] userId set to: ${sharedUserId}`);
}


// 키보드 입력 추적을 시작하는 함수
function startTracking() {
  const listener = new GlobalKeyboardListener(); // 글로벌 키보드 리스너 객체 생성

  listener.addListener(async (e) => {
    // 키가 눌렸고, 유저가 로그인되어 있으며, 허용된 키라면
    if ( e.state === 'DOWN' && sharedUserId && isAllowedKey(e.name)) {
      try {
        // ✅ 유효한 키 입력 시 해당 유저의 타수 증가
        await processTypingIncrement(sharedUserId);
        console.log('타수 증가됨:', e.name);
      } catch (err) {
        console.error('입력 저장 실패:', err); 
      }
    }
  });

  console.log('[TypingTracker] 키보드 입력 감지 시작됨');
}


// 어떤 키가 타수로 인정되는 유효 키인지 검사하는 함수
function isAllowedKey(keyName) {
  if (!keyName) return false;
  if (keyName.startsWith('MOUSE')) return false; // 마우스 제외

  // 제외할 키 목록 정의
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

  // 대문자로 변환
  if (ignored.includes(keyName.toUpperCase())) return false;

  // F1~F12 함수키 제외
  if (/^F[1-9]$|^F1[0-2]$/.test(keyName.toUpperCase())) return false;

  // 방향키 제외
  if (keyName.toUpperCase().startsWith('ARROW')) return false;

  return true; // 위 조건에 해당하지 않을 시 유효한 입력
}


// 다른 파일에서도 setUser, startTracking 함수를 사용할 수 있게 내보냄
module.exports = {
  setUser,
  startTracking,
};