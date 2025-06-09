import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';

import purpleIcon from './assets/보라 팁피.png';
import redCircle from './assets/빨강 캡슐.png';
import yellowCircle from './assets/노랑 캡슐.png';
import blueCircle from './assets/파랑 캡슐.png';
import tippeeIcon from './assets/pippy.png';
import settingsIcon from './assets/settings.png';

const DashboardPage = () => {
  const navigate = useNavigate();

  const [typingCount, setTypingCount] = useState(1125);
  const [capsules, setCapsules] = useState(3);
  const [hatched, setHatched] = useState(0);
  const [visibleColor, setVisibleColor] = useState(null);

  const missions = [
    { text: '타이핑 1,000타 달성하기', completed: true },
    { text: "'학교' 단어 입력하기", completed: false },
    { text: '팁피 1개 부화시키기', completed: false }
  ];

  const capsuleMessages = {
    red: '30타 더 입력 시 빨강 팁피 부화!',
    yellow: '30타 더 입력 시 노랑 팁피 부화!',
    blue: '30타 더 입력 시 파랑 팁피 부화!'
  };

  const handleCircleClick = (color) => {
    setVisibleColor(color);
    setTimeout(() => setVisibleColor(null), 4000);
  };

  return (
    <div className="dashboard-container">
      <div className="top-buttons">
        <button className="action-btn" onClick={() => navigate('/encyclopedia')}>
          <img src={tippeeIcon} alt="팁피" />
          팁피
        </button>
        <button className="action-btn" onClick={() => navigate('/setting')}>
          <img src={settingsIcon} alt="설정" />
          설정
        </button>
      </div>

      <div className="grid-container">
        <div className="grid-item achievements">
          <h2>오늘의 성과</h2>
          <div className="result-box">
            <p>총 타이핑 : {typingCount.toLocaleString()}타</p>
            <p>획득 캡슐 : {capsules}개</p>
            <p>부화한 팁피 : {hatched}종</p>
          </div>
        </div>

        <div className="grid-item mission">
          <h2>오늘의 미션</h2>
          <div className="missions">
            {missions.map((mission, idx) => (
              <div key={idx} className={`mission ${mission.completed ? 'completed' : ''}`}>
                <span className="mission-text">{mission.text}</span>
                {mission.completed && <span className="checkmark">✓</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="grid-item typing">
          <h2>타이핑</h2>
          <div className="typing-info">
            <img src={purpleIcon} alt="보라 팁피" />
            <p>{typingCount.toLocaleString()} 타이핑</p>
          </div>
        </div>

        <div className="grid-item progress">
          <h2>부화 진행도</h2>
          <div className="capsule-group">
            <img src={redCircle} alt="빨강 캡슐" onClick={() => handleCircleClick('red')} className="circle-img" />
            <img src={yellowCircle} alt="노랑 캡슐" onClick={() => handleCircleClick('yellow')} className="circle-img" />
            <img src={blueCircle} alt="파랑 캡슐" onClick={() => handleCircleClick('blue')} className="circle-img" />
          </div>

          {visibleColor && (
            <div className="progress-text">
              <p>■ ■ ■ ■ □ □ □ 70%</p>
              <p>{capsuleMessages[visibleColor]}</p>
            </div>
          )}
        </div>
      </div>

      <div className="logout-container">
        <button className="action-btn logout" onClick={() => navigate('/')}>
          로그아웃
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
