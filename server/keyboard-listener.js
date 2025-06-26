const { GlobalKeyboardListener } = require('node-global-key-listener');
// node-global-key-listener 모듈에서 전역 키보드 리스너 클래스 가져옴
// 키보드 입력을 감지할 수 있도록 함

const listener = new GlobalKeyboardListener();
// 새로운 리스너 인스턴스를 생성
// 키보드 이벤트를 감지

listener.addListener((e) => {
  console.log('키보드 입력:', e);
});
// 리스너에 이벤트 리스너 함수 등록
// 키가 눌리거나 떼어질 때마다 이 콜백 함수가 호출
// 'e'는 키 이벤트 객체, 어떤 키가 눌렸는지, 눌렸는지 뗐는지 등의 정보 포함