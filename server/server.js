const express = require('express');
const cors = require('cors');
const signupRouter = require('./SignupServer');
const loginRouter = require('./LoginServer'); 
const dashboardRouter = require('./DashboardServer');


const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/signup', signupRouter);
app.use('/api/login', loginRouter);
app.use('/api/dashboard', dashboardRouter);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
