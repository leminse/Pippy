import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';
import purpleIcon from './assets/보라 팁피.png';
import redCircle from './assets/빨강 캡슐.png';
import yellowCircle from './assets/노랑 캡슐.png';
import blueCircle from './assets/파랑 캡슐.png';
import tippeeIcon from './assets/pippy.png';
import settingsIcon from './assets/settings.png';

// 캡슐 색상별 이미지 매핑
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

  // 부화 메시지 포맷 함수
  const getCapsuleMessage = (color, remainingTyping) => {
    return `${remainingTyping}타 더 입력 시 ${color} 팁피 부화!`;
  };

  // 부화 진행도 텍스트 생성 (■ 갯수, 진행률 %)
  const renderProgressBar = (current, total) => {
    const progressPercent = Math.floor((current / total) * 100);
    const filledBlocks = Math.floor(progressPercent / 10); // 총 10칸
    const emptyBlocks = 10 - filledBlocks;

    return (
      <>
        <p>
          {'■ '.repeat(filledBlocks) + '□ '.repeat(emptyBlocks)} {progressPercent}%
        </p>
      </>
    );
  };

  // 초기 데이터 로드
  useEffect(() => {
    // typingCount 가져오기 예시
    fetch('/api/typing-count')
      .then(res => res.json())
      .then(data => setTypingCount(data.count))
      .catch(console.error);

    // 미션 목록 가져오기
    fetch('/api/missions')
      .then(res => res.json())
      .then(data => setMissions(data))
      .catch(console.error);

    // 캡슐 목록 가져오기
    fetch('/api/capsules')
      .then(res => res.json())
      .then(data => setCapsules(data))
      .catch(console.error);
  }, []);

  // 미션 클릭 처리
  const handleMissionClick = (index) => {
    const mission = missions[index];

    if (!mission.completed) {
      setMissionMessage('미션 실패..');
      setTimeout(() => setMissionMessage(''), 4000);
      return;
    }

    if (mission.rewarded) {
      setMissionMessage('미션 완료!');
      setTimeout(() => setMissionMessage(''), 4000);
      return;
    }

    // 보상 API 호출
    fetch(`/api/missions/${mission.id}/reward`, { method: 'POST' })
      .then(res => {
        if (!res.ok) throw new Error('보상 처리 실패');
        return res.json();
      })
      .then(data => {
        // 아이템 지급 로그 예시
        console.log(`아이템 지급: ${mission.text}`);

        // 상태 업데이트
        setMissions(prev => {
          const updated = [...prev];
          updated[index].rewarded = true;
          return updated;
        });

        setMissionMessage('미션 완료! 아이템을 획득했습니다.');
        setTimeout(() => setMissionMessage(''), 4000);
      })
      .catch(() => {
        setMissionMessage('보상 처리 중 오류가 발생했습니다.');
        setTimeout(() => setMissionMessage(''), 4000);
      });
  };

  // 캡슐 클릭 처리 - 선택한 캡슐 상태에 저장
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
        <button className="action-btn" onClick={() => navigate('/setting')}>
          <img src={settingsIcon} alt="설정" />
          설정
        </button>
      </div>

      <div className="grid-container">
        {/* 성과 */}
        <div className="grid-item achievements">
          <h2>오늘의 성과</h2>
          <div className="result-box">
            <p>총 타이핑 : {typingCount.toLocaleString()}타</p>
            <p>획득 캡슐 : {capsules.length}개</p>
            <p>부화한 팁피 : 0종{/* 부화한 팁피도 API로 가져와서 관리하세요 */}</p>
          </div>
        </div>

        {/* 미션 */}
        <div className="grid-item mission">
          <h2>오늘의 미션</h2>
          <div className="missions">
            {missions.map((mission, idx) => (
              <div
                key={mission.id}
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

        {/* 타이핑 */}
        <div className="grid-item typing">
          <h2>타이핑</h2>
          <div className="typing-info">
            <p>{typingCount.toLocaleString()} 타이핑</p>
          </div>
        </div>

        {/* 부화 진행도 */}
        <div className="grid-item progress">
          <h2>부화 진행도</h2>
          <div className="capsule-group">
            {capsules.length === 0 && <p>보유한 캡슐이 없습니다.</p>}
            {capsules.map((capsule) => (
              <img
                key={capsule.id}
                src={capsuleImages[capsule.color]}
                alt={`${capsule.color} 캡슐`}
                onClick={() => handleCapsuleClick(capsule)}
                className="circle-img"
              />
            ))}
          </div>

          {/* 선택된 캡슐 진행도 표시 */}
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

      {/* 로그아웃 */}
      <div className="logout-container">
        <button className="action-btn logout" onClick={() => navigate('/')}>
          로그아웃
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;