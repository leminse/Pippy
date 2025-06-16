import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './MainPage';
import './App.css';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import DashboardPage from './DashboardPage';
import EncyclopediaPage from './EncyclopediaPage';
import PippyPage from './PippyPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />}  />
        <Route path="/pippy" element={<PippyPage />} />
        <Route path="/encyclopedia" element={<EncyclopediaPage />} />
      </Routes>
    </Router>
  );
}

export default App;
