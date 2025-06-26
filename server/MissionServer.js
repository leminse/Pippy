const express = require('express');
const { v4: uuidv4 } = require('uuid'); 
// uuid 라이브러리에서 v4 함수를 가져옵니다.
// uuid는 유일한 식별 번호를 생성해주는 함수 주민등록번호처럼 중복되지 않습니다.
const pool = require('./db'); 
const router = express.Router(); 


// 미션 보상
async function processMissionReward(userId, userMissionId) {
  // user_missions 테이블에서 유저의 특정 미션 정보(완료 여부, 보상 여부)를 가져옴.
  const [rows] = await pool.query(
    `SELECT um.completed, um.rewarded
     FROM user_missions um
     WHERE um.user_mission_id = ? AND um.user_id = ?`,
    [userMissionId, userId]
  );

  // 미션 정보가 없다면 오류를 발생
  if (!rows.length) {
    throw new Error('해당하는 미션이 데이터베이스에 없습니다.');
  }

  const mission = rows[0]; // 가져온 미션 정보 변수에 저장

  // 미션이 아직 완료되지 않았으면 오류를 발생
  if (!mission.completed) {
    throw new Error('미션이 아직 완료되지 않았습니다.');
  }

  // 이미 보상을 받았다면 오류를 발생
  if (mission.rewarded) {
    throw new Error('이미 보상이 지급된 미션입니다.');
  }

  // 유저가 지금까지 얼마나 타이핑했는지를 누적해서 조회 (캡슐 부화 타이핑 기준으로 사용)
  const [typingRows] = await pool.query(
    `SELECT SUM(count) AS totalCount FROM typing_records WHERE user_id = ?`,
    [userId]
  );
  const currentTypingCount = typingRows[0].totalCount || 0; // 값이 없으면 0으로 처리

  // rendom()을 사용하여 'school' 보상 40% 확률, 나머지는 'basic'는 60% 확률
  const isSchool = Math.random() < 0.4;               
  const category = isSchool ? 'school' : 'basic';

  // 선택된 캡슐 중에서 무작위로 하나
  const [eggs] = await pool.query(
    `SELECT * FROM egg_types WHERE category = ? ORDER BY RAND() LIMIT 1`,
    [category]
  );

  // 등록된 캡슐 정보가 없으면 오류를 발생
  if (!eggs.length) {
    throw new Error('해당 카테고리에 보상 알 정보가 존재하지 않습니다.');
  }

  const selectedEgg = eggs[0]; // 선택된 알(캡슐) 정보를 저장합니다.

  // ✅ 유저에게 캡슐 지급
  await pool.query(
    `INSERT INTO eggs_user (egg_id, user_id, egg_type_id, name, goal_step, status, step, start_step)
     VALUES (?, ?, ?, ?, ?, 'new', 0, ?)`,
    [
      uuidv4(), // 고유한 알 ID를 생성
      userId, selectedEgg.egg_type_id,`${selectedEgg.color} 캡슐`, selectedEgg.goal_step, currentTypingCount 
    ]
  );

  // ✅ 해당 미션이 보상 완료됐음을 표시
  await pool.query(
    `UPDATE user_missions SET rewarded = TRUE WHERE user_mission_id = ?`,
    [userMissionId]
  );

  // 보상 지급 성공 메시지와 보상 캡슐 정보 전달
  return {
    message: '보상 지급이 정상적으로 완료되었습니다.',
    rewardedEgg: selectedEgg,
  };
}


// 외부에서 "/:userMissionId/reward" 경로로 POST 요청이 들어왔을 때 실행
router.post('/:userMissionId/reward', async (req, res) => {
  const { userMissionId } = req.params; 
  const { userId } = req.body; 

  try {
    // 보상 처리 함수를 호출하여 보상 지급
    const result = await processMissionReward(userId, userMissionId);
    res.json(result);
  } catch (err) {
    console.error('[Mission Reward Error]', err);
    res.status(400).json({ error: err.message || '보상 처리에 실패했습니다.' });
  }
});

module.exports = router; 