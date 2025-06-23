import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';
import purpleIcon from './assets/보라 팁피.png';
import redCircle from './assets/빨강 캡슐.png';
import yellowCircle from './assets/노랑 캡슐.png';
import blueCircle from './assets/파랑 캡슐.png';
import tippeeIcon from './assets/pippy.png';
import settingsIcon from './assets/settings.png';

const capsuleImages = {
  red: redCircle,
  yellow: yellowCircle,
  blue: blueCircle,
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const [typingCount, setTypingCount] = useState(0);
  const [missions, setMissions] = useState([]);
  const [missionMessage, setMissionMessage] = useState('');
  const [capsules, setCapsules] = useState([]);
  const [selectedCapsule, setSelectedCapsule] = useState(null);
  const [pippyCount, setPippyCount] = useState(0);

  const userId = localStorage.getItem('userId');

  const getCapsuleMessage = (color, remainingTyping) => {
    return `${remainingTyping}타 더 입력 시 ${color} 팁피 부화!`;
  };

  const renderProgressBar = (current, total) => {
    const progressPercent = Math.floor((current / total) * 100);
    const filledBlocks = Math.floor(progressPercent / 10);
    const emptyBlocks = 10 - filledBlocks;
    return (
      <>
        <p>
          {'■ '.repeat(filledBlocks) + '□ '.repeat(emptyBlocks)} {progressPercent}%
        </p>
      </>
    );
  };

  useEffect(() => {
    if (!userId) {
      alert('로그인이 필요합니다.');
      navigate('/');
      return;
    }

    fetch(`/api/dashboard/typing-count/${userId}`)
      .then(res => res.json())
      .then(data => setTypingCount(data.count))
      .catch(console.error);

    // 수정된 미션 API 호출 경로
    fetch(`/api/dashboard/missions/random`)
      .then(res => res.json())
      .then(data => setMissions(data))
      .catch(console.error);

    fetch(`/api/dashboard/capsules/${userId}`)
      .then(res => res.json())
      .then(data => setCapsules(data))
      .catch(console.error);

    fetch(`/api/dashboard/pippy/${userId}`)
      .then(res => res.json())
      .then(data => setPippyCount(data.count))
      .catch(console.error);
  }, [userId, navigate]);

  const handleMissionClick = (index) => {
    const mission = missions[index];

    if (!mission.completed) {
      setMissionMessage('미션 실패..');
      setTimeout(() => setMissionMessage(''), 4000);
      return;
    }

    if (mission.rewarded) {
      setMissionMessage('이미 완료된 미션입니다.');
      setTimeout(() => setMissionMessage(''), 4000);
      return;
    }

    fetch(`/api/mission/${mission.mission_id}/reward`, {  // mission.id → mission.mission_id
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
      .then(res => {
        if (!res.ok) throw new Error('보상 처리 실패');
        return res.json();
      })
      .then(() => {
        const updated = [...missions];
        updated[index].rewarded = true;
        setMissions(updated);
        setMissionMessage('미션 완료! 아이템을 획득했습니다.');
        setTimeout(() => setMissionMessage(''), 4000);
      })
      .catch(() => {
        setMissionMessage('보상 처리 중 오류가 발생했습니다.');
        setTimeout(() => setMissionMessage(''), 4000);
      });
  };

  const handleCapsuleClick = (capsule) => {
    setSelectedCapsule(capsule);
  };

  return (
    <div className="dashboard-container">
      <div className="top-buttons">
        <button className="action-btn" onClick={() => navigate('/pippy')}>
          <img src={tippeeIcon} alt="팁피" />
          팁피
        </button>
      </div>

      <div className="grid-container">
        <div className="grid-item achievements">
          <h2>오늘의 성과</h2>
          <div className="result-box">
            <p>총 타이핑 : {typingCount.toLocaleString()}타</p>
            <p>획득 캡슐 : {capsules.length}개</p>
            <p>부화한 팁피 : {pippyCount}종</p>
          </div>
        </div>

        <div className="grid-item mission">
          <h2>오늘의 미션</h2>
          <div className="missions">
            {missions.map((mission, idx) => (
              <div
                key={mission.mission_id}
                className={`mission ${mission.completed ? 'completed' : ''}`}
                onClick={() => handleMissionClick(idx)}
              >
                <span className="mission-text">{mission.text}</span>
                {mission.completed && <span className="checkmark">✓</span>}
              </div>
            ))}
          </div>
          {missionMessage && <div className="mission-message">{missionMessage}</div>}
        </div>

        <div className="grid-item typing">
          <h2>타이핑</h2>
          <div className="typing-info">
            <p>{typingCount.toLocaleString()} 타이핑</p>
          </div>
        </div>

        <div className="grid-item progress">
          <h2>부화 진행도</h2>
          <div className="capsule-group">
            {capsules.length === 0 && <p>보유한 캡슐이 없습니다.</p>}
            {capsules.map((capsule) => (
              <img
                key={capsule.egg_id}
                src={capsuleImages[capsule.color]}
                alt={`${capsule.color} 캡슐`}
                onClick={() => handleCapsuleClick(capsule)}
                className="circle-img"
              />
            ))}
          </div>
          {selectedCapsule && (
            <div className="progress-text">
              {renderProgressBar(selectedCapsule.currentTyping, selectedCapsule.totalTyping)}
              <p>
                {getCapsuleMessage(
                  selectedCapsule.color,
                  selectedCapsule.totalTyping - selectedCapsule.currentTyping
                )}
              </p>
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