import React, { useState } from 'react';
import './SignupPage.css';
import { useNavigate } from 'react-router-dom';

const SignupPage = () => {
  const navigate = useNavigate();

  // 입력값 상태 관리
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 회원가입 버튼 클릭 처리
  const handleSignupClick = async () => {
  setErrorMsg('');

  // 1) 아이디, 비밀번호 입력 확인
  if (!username || !password) {
    setErrorMsg('아이디와 비밀번호를 모두 입력해주세요.');
    return;
  }

  // 2) 비밀번호 확인 체크
  if (password !== confirmPassword) {
    setErrorMsg('비밀번호가 일치하지 않습니다.');
    return;
  }

  try {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      // 서버가 에러 메시지를 JSON으로 보내면 파싱 후 출력
      let errorMsgFromServer = '회원가입에 실패했습니다.';
      try {
        const errorData = await response.json();
        if (errorData && errorData.message) {
          errorMsgFromServer = errorData.message;
        }
      } catch {
        // JSON 파싱 실패 시 기본 메시지 사용
      }
      setErrorMsg(errorMsgFromServer);
      return;
    }

    // 성공 시
    const data = await response.json();
    console.log('회원가입 성공:', data);
    navigate('/login');
  } catch (error) {
    console.error('서버 요청 오류:', error);
    setErrorMsg('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
  }
};


  // 로그인 페이지로 이동
  const goToLogin = () => {
    navigate('/');
  };

  return (
    <main className="signup-box">
      <h1 className="title">
        <img src="/logo.png" alt="로고" className="logo-img" />
        회원가입
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

      <input
        type="password"
        placeholder="비밀번호 확인"
        className="input"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      {/* 에러 메시지 출력 */}
      {errorMsg && <p className="error-msg">{errorMsg}</p>}

      <button className="signup-btn" onClick={handleSignupClick}>
        회원가입
      </button>

      <p className="signup-link" onClick={goToLogin}>
        로그인하러 가기
      </p>
    </main>
  );
};

export default SignupPage;