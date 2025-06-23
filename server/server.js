const express = require('express');
const cors = require('cors');
const { GlobalKeyboardListener } = require('node-global-key-listener');

const signupRouter = require('./SignupServer');
const loginRouter = require('./LoginServer'); 
const dashboardRouter = require('./DashboardServer');
const missionRouter = require('./MissionServer');


const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/signup', signupRouter);
app.use('/api/login', loginRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/mission', missionRouter);

const listener = new GlobalKeyboardListener();  // 키보드 리스너 생성

listener.addListener((e) => {
  if (e.state === 'DOWN') {
    console.log('키 입력 감지:', e.name);
    // 여기에 타수 누적 로직 추가 가능
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
 