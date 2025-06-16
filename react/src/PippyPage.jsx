import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import pippyImage from "./assets/pippy.png";
import "./PippyPage.css";

function PippyPage() {
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const navigate = useNavigate();

  const tippees = [1, 2];

  const handleSortClick = () => {
    setShowSortDropdown(!showSortDropdown);
  };

  return (
    <div className="encyclopedia-container">
      <div className="encyclopedia-board" style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {tippees.map((id) => (
          <div
            key={id}
            onClick={() => navigate(`/encyclopedia/${id}`)}
            style={{ cursor: "pointer", width: "120px", height: "120px" }}
          >
            <img
              src={pippyImage}
              alt={`팁피 ${id}`}
              style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "8px" }}
            />
          </div>
        ))}
      </div>

      <div className="encyclopedia-menu">
        <div className="button-wrapper">
          <button className="main-button" onClick={handleSortClick}>
            색상 정렬
          </button>
          {showSortDropdown && (
            <div className="sort-dropdown">
              <button>색상 정렬</button>
              <button>획득일 정렬</button>
            </div>
          )}
        </div>
        <button className="main-button">도감</button>
      </div>
    </div>
  );
}

export default PippyPage;