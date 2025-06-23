const express = require('express');
const pool = require('./db');

const router = express.Router();
router.use(express.json());

// 총 타수 조회
router.get('/api/typing-count/:userId', async (req, res) => {
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
router.get('/api/capsules/:userId', async (req, res) => {
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
router.get('/api/pippy/:userId', async (req, res) => {
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

// 타자 입력 횟수 업데이트 및 캡슐 부화 진행
router.post('/typing/:userId', async (req, res) => {
  const { userId } = req.params;
  const { typingIncrement } = req.body;

  try {
    const [eggs] = await pool.query(
      `SELECT egg_id, step, goal_step, status FROM eggs WHERE user_id = ? AND status != 'hatched'`,
      [userId]
    );

    for (const egg of eggs) {
      const newStep = egg.step + typingIncrement;
      let newStatus = egg.status;
      if (newStep >= egg.goal_step) newStatus = 'hatched';

      await pool.query(
        `UPDATE eggs SET step = ?, status = ? WHERE egg_id = ?`,
        [newStep, newStatus, egg.egg_id]
      );

      if (newStatus === 'hatched') {
        await pool.query(
          `INSERT INTO pippy (pippy_id, egg_id, user_id, name) VALUES (?, ?, ?, ?)`,
          [`pippy_${egg.egg_id}`, egg.egg_id, userId, `${egg.color} 팁피`]
        );
      }
    }

    res.json({ message: '타수 업데이트 및 부화 진행 완료' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '업데이트 실패' });
  }
});

module.exports = router;