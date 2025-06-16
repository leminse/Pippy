import React from 'react';
import './DashboardPage';
import purpleTippee from './assets/보라 팁피.png'; // 이미지 경로는 필요에 맞게 조정하세요

const EncyclopediaPage = ({ onClose }) => {
  return (
    <div className="detail-overlay">
      <div className="tippee-card">
        {/* 상단 아이콘 */}
        <div className="top-row">
          <button className="nav-btn">←</button>
          <button className="star-btn">⭐</button>
        </div>

        {/* 팁피 이미지 */}
        <img src={purpleTippee} alt="보라 팁피" className="보라 팁피.png" />
        <div className="tippee-name">
          보라 팁피 <span className="edit-icon">✏️</span>
        </div>

        <hr />

        {/* 설명 */}
        <div className="tippee-info">
          <p>장식 타입 : 기본</p>
          <p>성격 : 엉뚱하고 호기심 많은 성격</p>
          <p>능력 : 특수 캡슐 발견 확률 증가</p>
        </div>

        {/* 닫기 버튼 (선택사항) */}
        <button className="close-btn" onClick={onClose}>닫기</button>
      </div>
    </div>
  );
};

export default EncyclopediaPage;