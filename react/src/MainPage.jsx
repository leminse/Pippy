import React from 'react';
import './MainPage.css';
import { useNavigate } from 'react-router-dom';

const MainPage = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignupClick = () => {
    navigate('/signup');
  };

  return (
    <main className="box">
      <h1 className="title">Pippy</h1>
      <button className="btn" onClick={handleLoginClick}>
        로그인
      </button>
      <button className="btn" onClick={handleSignupClick}>
        회원가입
      </button>
    </main>
  );
};

export default MainPage;