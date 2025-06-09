import React from 'react';
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLoginClick  = () => {
    navigate('/dashboard');
  };

  const goToSignup = () => {
    navigate('/signup');
  };

  return (

      <main className="login-box">

        <h1 className="title">
            <img src="/logo.png" alt="로고" className="logo-img" />
            로그인
        </h1>

        <input type="text" placeholder="아이디를 입력해주세요" className="input" />
        <p className="error-msg">존재하지 않는 아이디 입니다.</p>

        <input type="password" placeholder="비밀번호를 입력해주세요" className="input" />
        <p className="error-msg">존재하지 않는 아이디 입니다.</p>

        <button className="login-btn" onClick={handleLoginClick} >로그인</button>

        <p className="signup-link" onClick={goToSignup}>회원가입하러 가기</p>
      </main>

  );
};

export default LoginPage;
