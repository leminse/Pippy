const express = require('express');
const pool = require('./db');

const router = express.Router();
router.use(express.json());

// 총 타수 조회
router.get('/typing-count/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT SUM(count) AS total FROM typing_records WHERE user_id = ?`,
      [userId]
    );
    res.json({ count: rows[0].total || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '타수 조회 실패' });
  }
});

// 캡슐 목록 조회
router.get('/capsules/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT egg_id, color, step AS currentTyping, goal_step AS totalTyping, status FROM eggs WHERE user_id = ?`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '캡슐 조회 실패' });
  }
});

// 팁피 개수 조회
router.get('/pippy/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS total FROM pippy WHERE user_id = ?`,
      [userId]
    );
    res.json({ count: rows[0].total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '팁피 수 조회 실패' });
  }
});

// 미션 3개 랜덤 조회 (typing, hatch, word 각 1개씩)
router.get('/missions/random', async (req, res) => {
  try {
    const types = ['typing', 'hatch', 'word'];
    const missions = [];

    for (const type of types) {
      const [rows] = await pool.query(
        `SELECT mission_id, text, target_count, type
         FROM missions
         WHERE type = ?
         ORDER BY RAND()
         LIMIT 1`,
        [type]
      );
      if (rows.length > 0) {
        missions.push(rows[0]);
      }
    }

    res.json(missions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '미션 조회 실패' });
  }
});

// 키보드 입력 처리 함수
async function processTypingIncrement(userId, increment = 1) {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  // 오늘 기록 확인
  const [existing] = await pool.query(
    `SELECT * FROM typing_records WHERE user_id = ? AND DATE(timestamp) = ?`,
    [userId, today]
  );

  if (existing.length > 0) {
    await pool.query(
      `UPDATE typing_records SET count = count + ? WHERE id = ?`,
      [increment, existing[0].id]
    );
  } else {
    await pool.query(
      `INSERT INTO typing_records (user_id, count, timestamp) VALUES (?, ?, ?)`,
      [userId, increment, now]
    );
  }

  // 캡슐 부화 처리
  const [eggs] = await pool.query(
    `SELECT egg_id, step, goal_step, status, color FROM eggs WHERE user_id = ? AND status != 'hatched'`,
    [userId]
  );

  for (const egg of eggs) {
    const newStep = egg.step + increment;
    let newStatus = egg.status;
    if (newStep >= egg.goal_step) newStatus = 'hatched';

    await pool.query(
      `UPDATE eggs SET step = ?, status = ? WHERE egg_id = ?`,
      [Math.min(newStep, egg.goal_step), newStatus, egg.egg_id]
    );

    if (newStatus === 'hatched') {
      await pool.query(
        `INSERT INTO pippy (pippy_id, egg_id, user_id, name) VALUES (?, ?, ?, ?)`,
        [`pippy_${egg.egg_id}`, egg.egg_id, userId, `${egg.color} 팁피`]
      );
    }
  }
}

// 타수 입력 API
router.post('/typing/:userId', async (req, res) => {
  const { userId } = req.params;
  const { typingIncrement } = req.body;

  if (!Number.isInteger(typingIncrement) || typingIncrement <= 0) {
    return res.status(400).json({ error: '유효하지 않은 타이핑 수입니다.' });
  }

  try {
    await processTypingIncrement(userId, typingIncrement);
    res.json({ message: '타수 업데이트 및 부화 완료' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '업데이트 실패' });
  }
});

module.exports = router;
module.exports.processTypingIncrement = processTypingIncrement;