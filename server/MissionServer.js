const express = require('express');
const pool = require('./db');
const router = express.Router();

router.use(express.json());

// 1. 미션 목록 조회
router.get('/api/missions/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT um.user_mission_id AS id, m.text, um.completed, um.rewarded
      FROM user_missions um
      JOIN missions m ON um.mission_id = m.mission_id
      WHERE um.user_id = ?
    `, [userId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '미션 목록 조회 실패' });
  }
});

// 2. 미션 보상 처리
router.post('/api/missions/:missionId/reward', async (req, res) => {
  const { missionId } = req.params;
  const { userId } = req.body;

  try {
    await pool.query(`
      UPDATE user_missions
      SET rewarded = TRUE
      WHERE mission_id = ? AND user_id = ?
    `, [missionId, userId]);

    res.json({ message: '보상 완료' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '보상 처리 실패' });
  }
});

module.exports = router;
