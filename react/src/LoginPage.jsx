import React, { useState } from 'react';
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginClick = async () => {
    setErrorMsg('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (!response.ok) {
        setErrorMsg('아이디 또는 비밀번호가 잘못되었습니다.');
        return;
      }

      console.log('로그인 성공:', data);
      localStorage.setItem('userId', data.userId);
      navigate('/dashboard');
    } catch (error) {
      console.error('로그인 요청 중 오류 발생:', error);
      setErrorMsg('서버 오류가 발생했습니다.');
    }
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

      <input
        type="text"
        placeholder="아이디를 입력해주세요"
        className="input"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="비밀번호를 입력해주세요"
        className="input"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {errorMsg && <p className="error-msg">{errorMsg}</p>}

      <button className="login-btn" onClick={handleLoginClick}>로그인</button>

      <p className="signup-link" onClick={goToSignup}>회원가입하러 가기</p>
    </main>
  );
};

export default LoginPage;