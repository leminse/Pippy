import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';

import redCircle from './assets/빨강 캡슐.png';
import yellowCircle from './assets/노랑 캡슐.png';
import blueCircle from './assets/파랑 캡슐.png';
import greenCircle from './assets/초록 캡슐.png';
import purpleCircle from './assets/보라 캡슐.png';
import school_purple_Circle from './assets/학교_보라 캡슐.png';
import school_blue_Circle from './assets/학교_파랑 캡슐.png';
import school_yellow_Circle from './assets/학교_노랑 캡슐.png';
import school_red_Circle from './assets/학교_빨강 캡슐.png';
import school_green_Circle from './assets/학교_초록 캡슐.png';

import redTippee from './assets/빨강 팁피.png';
import blueTippee from './assets/파랑 팁피.png';
import yellowTippee from './assets/노랑 팁피.png';
import greenTippee from './assets/초록 팁피.png';
import purpleTippee from './assets/보라 팁피.png';
import school_blue_Tippee from './assets/교복 팁피.png';
import school_green_Tippee from './assets/명찰 팁피.png';
import school_red_Tippee from './assets/칠판 팁피.png';
import school_yellow_Tippee from './assets/책상&의자 팁피.png';
import school_purple_Tippee from './assets/시간표 팁피.png';
import tippeeIcon from './assets/pippy.png';

const capsuleImages = {
  red: redCircle,
  yellow: yellowCircle,
  blue: blueCircle,
  green: greenCircle,
  purple: purpleCircle,
  school_red: school_red_Circle,
  school_yellow: school_yellow_Circle,
  school_blue: school_blue_Circle,
  school_green: school_green_Circle,
  school_purple: school_purple_Circle,
};

const pippyImages = {
  red: redTippee,
  yellow: yellowTippee,
  blue: blueTippee,
  green: greenTippee,
  purple: purpleTippee,
  school_red: school_red_Tippee,
  school_yellow: school_yellow_Tippee,
  school_blue: school_blue_Tippee,
  school_green: school_green_Tippee,
  school_purple: school_purple_Tippee,
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const [typingCount, setTypingCount] = useState(0);
  const [missions, setMissions] = useState([]);
  const [missionMessage, setMissionMessage] = useState('');
  const [capsules, setCapsules] = useState([]);
  const [selectedCapsule, setSelectedCapsule] = useState(null);

  // 캡슐 메시지 상태 및 타이머 ref
  const [capsuleMessage, setCapsuleMessage] = useState('');
  const capsuleMessageTimeoutRef = useRef(null);

  // 미션 메시지 타이머 ref
  const missionTimeoutRef = useRef(null);

  const [pippyList, setPippyList] = useState([]);

  const userId = localStorage.getItem('userId');

  const getCapsuleMessage = (color, remainingTyping) => {
    return `${remainingTyping}타 더 입력 시 ${color} 팁피 부화!`;
  };

  const renderProgressBar = (current, total) => {
    const progressPercent = Math.floor((current / total) * 100);
    const filledBlocks = Math.floor(progressPercent / 10);
    const emptyBlocks = 10 - filledBlocks;
    return (
      <p>
        {'■ '.repeat(filledBlocks) + '□ '.repeat(emptyBlocks)} {progressPercent}%
      </p>
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

    fetch(`/api/dashboard/missions/today/${userId}`)
      .then(res => res.json())
      .then(data => setMissions(data))
      .catch(console.error);

    fetch(`/api/dashboard/capsules/${userId}`)
      .then(res => res.json())
      .then(data => setCapsules(data))
      .catch(console.error);

    fetch(`/api/dashboard/pippy/${userId}`)
      .then(res => res.json())
      .then(data => setPippyList(data))
      .catch(console.error);
  }, [userId, navigate]);

  const refreshCapsules = () => {
    fetch(`/api/dashboard/capsules/${userId}`)
      .then(res => res.json())
      .then(data => setCapsules(data))
      .catch(console.error);
  };

  const handleMissionClick = (index) => {
    const mission = missions[index];

    if (!mission.completed) {
      setMissionMessage('미션 실패..');
      clearTimeout(missionTimeoutRef.current);
      missionTimeoutRef.current = setTimeout(() => setMissionMessage(''), 3000);
      return;
    }

    if (mission.rewarded) {
      setMissionMessage('이미 완료된 미션입니다.');
      clearTimeout(missionTimeoutRef.current);
      missionTimeoutRef.current = setTimeout(() => setMissionMessage(''), 3000);
      return;
    }

    fetch(`/api/mission/${mission.user_mission_id}/reward`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
      .then(res => {
        if (!res.ok) throw new Error('보상 처리 실패');
        return res.json();
      })
      .then(() => {
        refreshCapsules();

        const updated = [...missions];
        updated[index].rewarded = true;
        setMissions(updated);
        setMissionMessage('미션 완료! 캡슐을 획득했습니다.');

        clearTimeout(missionTimeoutRef.current);
        missionTimeoutRef.current = setTimeout(() => setMissionMessage(''), 3000);
      })
      .catch(() => {
        setMissionMessage('보상 처리 중 오류가 발생했습니다.');
        clearTimeout(missionTimeoutRef.current);
        missionTimeoutRef.current = setTimeout(() => setMissionMessage(''), 3000);
      });
  };

  const handleCapsuleClick = (capsule) => {
    setSelectedCapsule(capsule);

    const message = getCapsuleMessage(
      capsule.color,
      capsule.goal_step - capsule.step
    );
    setCapsuleMessage(message);

    if (capsuleMessageTimeoutRef.current) {
      clearTimeout(capsuleMessageTimeoutRef.current);
    }
    capsuleMessageTimeoutRef.current = setTimeout(() => {
      setCapsuleMessage('');
      setSelectedCapsule(null);
    }, 3000);
  };

  return (
    <div className="dashboard-container">
      <div className="grid-container">
        <div className="grid-item achievements">
          <h2>오늘의 성과</h2>
          <div className="result-box">
            <p>총 타이핑 : {typingCount.toLocaleString()}타</p>
            <p>획득 캡슐 : {capsules.length}개</p>
            <p>부화한 팁피 : {pippyList.length}종</p>
          </div>
        </div>

        <div className="grid-item mission">
          <h2>오늘의 미션</h2>
          <div className="missions">
            {missions.map((mission, idx) => (
              <div
                key={mission.user_mission_id}
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
          {capsuleMessage && (
            <div className="progress-text">
              {selectedCapsule && renderProgressBar(selectedCapsule.step, selectedCapsule.goal_step)}
              <p>{capsuleMessage}</p>
            </div>
          )}
        </div>

        <div className="grid-item pippy-list">
          <h2>부화한 팁피</h2>
          <div className="pippy-box">
            {pippyList.map((pippy, idx) => (
              <div key={pippy.pippy_id} className="pippy-card">
                <img
                  src={pippyImages[pippy.color] || tippeeIcon}
                  alt={`${pippy.color} 팁피`}
                />
                <p>팁피 #{idx + 1}</p>
              </div>
            ))}
          </div>
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