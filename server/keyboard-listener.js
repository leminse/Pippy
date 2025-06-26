const { GlobalKeyboardListener } = require('node-global-key-listener');
// node-global-key-listener 모듈에서 전역 키보드 리스너 클래스를 가져옵니다.
// 이 모듈은 백그라운드에서도 키보드 입력을 감지할 수 있도록 도와줍니다.

const listener = new GlobalKeyboardListener();
// 새로운 리스너 인스턴스를 생성합니다.
// 이제 이 객체를 통해 키보드 이벤트를 감지할 수 있습니다.

listener.addListener((e) => {
  console.log('키보드 입력:', e);
});
// 리스너에 이벤트 리스너 함수를 등록합니다.
// 키가 눌리거나 떼어질 때마다 이 콜백 함수가 호출됩니다.
// 'e'는 키 이벤트 객체이며, 어떤 키가 눌렸는지, 눌렸는지 뗐는지 등의 정보를 포함합니다.