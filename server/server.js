const express = require('express');
const cors = require('cors');

const signupRouter = require('./SignupServer');
const loginRouter = require('./LoginServer'); 
const dashboardRouter = require('./DashboardServer');
const missionRouter = require('./MissionServer');

const typingTracker = require('./TypingTracker'); 
typingTracker.startTracking();  // 서버 시작 시 한 번만 실행

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/signup', signupRouter);
app.use('/api/login', loginRouter);  // 로그인 시 TypingTracker.setUser 호출
app.use('/api/dashboard', dashboardRouter);
app.use('/api/mission', missionRouter);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});