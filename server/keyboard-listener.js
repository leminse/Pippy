const { GlobalKeyboardListener } = require('node-global-key-listener');

const listener = new GlobalKeyboardListener();

listener.addListener((e) => {
  console.log('키보드 입력:', e);
});
