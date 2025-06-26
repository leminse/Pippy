import React, { useState, useEffect } from 'react';
import './DashboardPage.css';

const EncyclopediaPage = ({ userId, onClose }) => {
  const [pippyList, setPippyList] = useState([]);
  const [selectedPippy, setSelectedPippy] = useState(null);

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/pippy-list/${userId}`)
      .then(res => res.json())
      .then(data => setPippyList(data))
      .catch(console.error);
  }, [userId]);

  // 3개씩 행 나누기
  const rows = [];
  for (let i = 0; i < pippyList.length; i += 3) {
    rows.push(pippyList.slice(i, i + 3));
  }

  return (
    <div className="encyclopedia-overlay">
      <button className="close-btn" onClick={onClose}>닫기</button>

      <div className="pippy-grid">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="pippy-row" style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
            {row.map(pippy => (
              <img
                key={pippy.pippy_user_id}
                src={pippy.image_url}
                alt={pippy.name}
                className="pippy-thumb"
                style={{ width: '100px', height: '100px', cursor: 'pointer' }}
                onClick={() => setSelectedPippy(pippy)}
              />
            ))}
          </div>
        ))}
        {pippyList.length === 0 && <p>보유한 팁피가 없습니다.</p>}
      </div>

      {selectedPippy && (
        <div className="pippy-detail-modal" style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          zIndex: 1000,
          width: '300px'
        }}>
          <button
            onClick={() => setSelectedPippy(null)}
            style={{ float: 'right', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
          >×</button>
          <img
            src={selectedPippy.image_url}
            alt={selectedPippy.name}
            style={{ width: '150px', height: '150px', display: 'block', margin: '0 auto 10px' }}
          />
          <h3 style={{ textAlign: 'center' }}>{selectedPippy.name}</h3>
          <p><strong>성격:</strong> {selectedPippy.personality}</p>
          <p><strong>설명:</strong> {selectedPippy.description}</p>
        </div>
      )}

      {/* 모달 백드롭 */}
      {selectedPippy && (
        <div
          onClick={() => setSelectedPippy(null)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 999
          }}
        />
      )}
    </div>
  );
};

export default EncyclopediaPage;