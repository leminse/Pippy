import React from 'react';
import './SignupPage.css';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleSignupClick  = () => {
    navigate('/');
  };

  const goToLogin = () => {
    navigate('/login');
  };

  return (

      <main className="signup-box">

        <h1 className="title">
            <img src="/logo.png" alt="로고" className="logo-img" />
            회원가입
        </h1>

        <input type="text" placeholder="아이디를 입력해주세요" className="input" />
        <p className="error-msg">존재하지 않는 아이디 입니다.</p>

        <input type="password" placeholder="비밀번호를 입력해주세요" className="input" />
        <p className="error-msg">존재하지 않는 아이디 입니다.</p>

        <input type="password" placeholder="비밀번호를 입력해주세요" className="input" />
        <p className="error-msg">존재하지 않는 아이디 입니다.</p>

        <button className="signup-btn" onClick={handleSignupClick} >회원가입</button>

        <p className="signup-link" onClick={goToLogin}>로그인하러 가기</p> 
      </main>

  );
};

export default LoginPage;
