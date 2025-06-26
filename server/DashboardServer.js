const express = require('express'); 
const { v4: uuidv4 } = require('uuid'); 
const pool = require('./db'); 
const router = express.Router(); 

router.use(express.json()); 

//✅ 총 타이핑 조회 API (오늘 날짜 기준)
router.get('/typing-count/:userId', async (req, res) => {
  const { userId } = req.params; 
  // URL 경로에서 userId 값을 추출

  try {
    const [rows] = await pool.query(
      `SELECT SUM(count) AS total FROM typing_records 
       WHERE user_id = ? AND DATE(timestamp) = CURDATE()`,
      [userId]
    );
    // 오늘 날짜 타자 기록 전체를 더해서 total로 가져옴
    // CURDATE()는 오늘 날짜
    
    res.json({ count: rows[0].total || 0 }); 
    // 결과가 없으면 0으로 반환. 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '타이핑 조회 실패' }); 
  }
});

// ✅ 오늘 미션 조회 및 미션 자동 생성 API
router.get('/missions/today/:userId', async (req, res) => {
  const { userId } = req.params;
  const today = new Date().toISOString().slice(0, 10); 
  // 오늘 날짜 추출 (yyyy-mm-dd)

  try {
    // 사용자가 오늘 생성된 미션 조회
    const [existing] = await pool.query(
      `SELECT um.user_mission_id, m.text, m.target_count, m.type, um.completed, um.rewarded
       FROM user_missions um
       JOIN missions m ON um.mission_id = m.mission_id
       WHERE um.user_id = ? AND DATE(um.created_at) = ?`,
      [userId, today]
    );

    if (existing.length >= 2) return res.json(existing);
    // 오늘 미션이 2개 이상 이미 있으면 그대로 반환하고 종료

    // 미션 타입 배열 정의 (typing, hatch)
    const types = ['typing', 'hatch'];
    const missionIds = [];

    // 각 타입별로 미션 테이블에서 무작위 미션 1개씩 선택
    for (const type of types) {
      const [rows] = await pool.query(
        `SELECT mission_id FROM missions WHERE type = ? ORDER BY RAND() LIMIT 1`,
        [type]
      );
      if (rows.length > 0) missionIds.push(rows[0].mission_id);
    }

    // 이미 있는 미션 개수와 최대 2개 제한을 고려하여 새 미션을 INSERT
    const remainCount = 2 - existing.length;
    const toInsert = missionIds.slice(0, remainCount);
    for (const missionId of toInsert) {
      await pool.query(
        `INSERT INTO user_missions (user_id, mission_id) VALUES (?, ?)`,
        [userId, missionId]
      );
    }

    // 최종 생성된 오늘 미션 목록 재조회 후 응답
    const [finalMissions] = await pool.query(
      `SELECT um.user_mission_id, m.text, m.target_count, m.type, um.completed, um.rewarded
       FROM user_missions um
       JOIN missions m ON um.mission_id = m.mission_id
       WHERE um.user_id = ? AND DATE(um.created_at) = ?`,
      [userId, today]
    );

    res.json(finalMissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '오늘 미션 조회 실패' });
  }
});

// 사용자 캡슐 조회 API (부화 완료된 캡슐 제외)
router.get('/capsules/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    // 사용자 계정의 캡슐 중 상태가 'hatched'(부화 완료)가 아닌 것만 조회
    // eggs_user 테이블과 egg_types 테이블 조인하여 색상 등 정보 포함
    const [rows] = await pool.query(
      `SELECT e.egg_id, et.color, e.step, e.goal_step, e.status
       FROM eggs_user e
       JOIN egg_types et ON e.egg_type_id = et.egg_type_id
       WHERE e.user_id = ? AND e.status != 'hatched'`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '캡슐 조회 실패' });
  }
});

// 사용자 팁피(pippy) 개수 조회 API
router.get('/pippy/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    // pippy_user, pippy_types, egg_types 테이블을 조인하여
    // 사용자가 보유한 팁피 목록과 색상 정보 조회
    const [rows] = await pool.query(
      `SELECT pu.pippy_id, et.color
       FROM pippy_user pu
       JOIN pippy_types pt ON pu.pippy_type_id = pt.pippy_type_id
       JOIN egg_types et ON pt.egg_type_id = et.egg_type_id
       WHERE pu.user_id = ?`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '팁피 조회 실패' });
  }
});

// ✅ 미션 완료 조건 확인 함수 (오늘 날짜 기준)
// 미션 중 완료되지 않은 것만 대상으로 타이핑 및 부화 개수를 체크해서 완료 처리함
async function checkMissionCompletion(userId) {
  const today = new Date().toISOString().slice(0, 10);

  // 미완료 미션 목록 조회
  const [missions] = await pool.query(
    `SELECT um.user_mission_id, m.type, m.target_count
     FROM user_missions um
     JOIN missions m ON um.mission_id = m.mission_id
     WHERE um.user_id = ? AND DATE(um.created_at) = ? AND um.completed = FALSE`,
    [userId, today]
  );

  if (!missions.length) return; // 완료할 미션이 없으면 함수 종료

  // 오늘 날짜 타이핑 총합 조회
  const [[{ total: totalTyping = 0 }]] = await pool.query(
    `SELECT SUM(count) AS total FROM typing_records 
     WHERE user_id = ? AND DATE(timestamp) = ?`,
    [userId, today]
  );

  // 오늘 생성된 팁피 총 개수 조회
  const [[{ total: totalPippy = 0 }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM pippy_user 
     WHERE user_id = ? AND DATE(created_at) = ?`,
    [userId, today]
  );

  // 미션별 조건에 맞게 완료 여부 체크 후 완료 처리 업데이트
  for (const m of missions) {
    let isComplete = false;
    if (m.type === 'typing' && totalTyping >= m.target_count) isComplete = true;
    if (m.type === 'hatch' && totalPippy >= m.target_count) isComplete = true;

    if (isComplete) {
      await pool.query(
        `UPDATE user_missions SET completed = TRUE WHERE user_mission_id = ?`,
        [m.user_mission_id]
      );
    }
  }
}

// ✅ 타이핑 증가 처리 함수
// 입력된 타이핑만큼 typing_records 테이블에 반영하고 알 부화 상태도 업데이트
async function processTypingIncrement(userId, increment = 1) {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  // 오늘 날짜에 이미 타이핑 기록이 있는지 조회
  const [existing] = await pool.query(
    `SELECT * FROM typing_records WHERE user_id = ? AND DATE(timestamp) = ?`,
    [userId, today]
  );

  if (existing.length > 0) {
    // 이미 기록 있으면 타이핑 누적 업데이트
    await pool.query(
      `UPDATE typing_records SET count = count + ? WHERE id = ?`,
      [increment, existing[0].id]
    );
  } else {
    // 기록 없으면 신규 INSERT
    await pool.query(
      `INSERT INTO typing_records (user_id, count, timestamp) VALUES (?, ?, ?)`,
      [userId, increment, now]
    );
  }

  // 부화 중인 알(캡슐) 조회 (부화 완료된 것은 제외)
  const [eggs] = await pool.query(
    `SELECT e.egg_id, e.step, e.goal_step, e.status, et.color, et.category, e.egg_type_id
     FROM eggs_user e
     JOIN egg_types et ON e.egg_type_id = et.egg_type_id
     WHERE e.user_id = ? AND e.status != 'hatched'`,
    [userId]
  );

  // 각 알의 진행 단계(step)를 타이핑만큼 증가
  // 목표 단계(goal_step)를 넘으면 상태를 'hatched'(부화 완료)로 변경
  for (const egg of eggs) {
    const newStep = egg.step + increment;
    const newStatus = newStep >= egg.goal_step ? 'hatched' : egg.status;
    await pool.query(
      `UPDATE eggs_user SET step = ?, status = ? WHERE egg_id = ?`,
      [Math.min(newStep, egg.goal_step), newStatus, egg.egg_id]
    );

    // 부화 완료된 알에 대해 팁피 테이블에 새 팁피 생성
    if (newStatus === 'hatched') {
      const [pippyType] = await pool.query(
        `SELECT pippy_type_id FROM pippy_types WHERE egg_type_id = ? LIMIT 1`,
        [egg.egg_type_id]
      );
      if (pippyType.length > 0) {
        await pool.query(
          `INSERT INTO pippy_user (pippy_id, user_id, egg_id, pippy_type_id)
           VALUES (?, ?, ?, ?)`,
          [uuidv4(), userId, egg.egg_id, pippyType[0].pippy_type_id]
        );
      }
    }
  }

  // 마지막으로 미션 완료 여부 체크
  await checkMissionCompletion(userId);
}

// 타이핑 입력 API 라우터
router.post('/typing/:userId', async (req, res) => {
  const { userId } = req.params;
  const { typingIncrement } = req.body;

  // 타이핑가 양의 정수인지 검증
  if (!Number.isInteger(typingIncrement) || typingIncrement <= 0) {
    return res.status(400).json({ error: '유효하지 않은 타이핑' });
  }

  try {
    // 타이핑 처리 함수 호출
    await processTypingIncrement(userId, typingIncrement);
    res.json({ message: '처리 완료' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '오류 발생' });
  }
});

// 미션 목록 조회 API
router.get('/missions/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    // 오늘 생성된 미션 목록 조회
    const [rows] = await pool.query(
      `SELECT um.user_mission_id, m.text, um.completed, um.rewarded
       FROM user_missions um
       JOIN missions m ON um.mission_id = m.mission_id
       WHERE um.user_id = ? AND DATE(um.created_at) = CURDATE()`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '미션 목록 조회 실패' });
  }
});

// 미션 보상 API
router.post('/missions/:userMissionId/reward', async (req, res) => {
  const { userMissionId } = req.params;
  const { userId } = req.body;

  try {
    // 실제 보상 처리 함수는 MissionServer.js에 있음
    const result = await processMissionReward(userId, userMissionId);
    res.json(result);
  } catch (err) {
    console.error('[Mission Reward Error]', err);
    res.status(400).json({ error: err.message || '보상 처리 실패' });
  }
});

module.exports = router; 
module.exports.processTypingIncrement = processTypingIncrement; 
// 타이핑 처리 함수 외부에서 직접 호출할 수 있게 내보냄