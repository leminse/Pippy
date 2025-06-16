const express = require('express');
const mysql = require('mysql2/promise');
const app = express();

app.use(express.json());

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'yourpassword',
  database: 'yourdb',
});

// 캡슐 목록 조회
app.get('/api/capsules/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT egg_id, color, step, goal_step, status FROM eggs WHERE user_id = ?`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB 조회 실패' });
  }
});

// 타자 입력 횟수 업데이트 및 캡슐 부화 진행 (예시)
app.post('/api/typing/:userId', async (req, res) => {
  const { userId } = req.params;
  const { typingIncrement } = req.body; // 이번에 추가된 타수

  try {
    // 1) 기존 알 상태 불러오기
    const [eggs] = await pool.query(
      `SELECT egg_id, step, goal_step, status FROM eggs WHERE user_id = ? AND status != 'hatched'`,
      [userId]
    );

    // 2) 각 알에 타수 추가, 목표 달성 시 상태 변경
    for (const egg of eggs) {
      const newStep = egg.step + typingIncrement;
      let newStatus = egg.status;
      if (newStep >= egg.goal_step) newStatus = 'hatched';

      await pool.query(
        `UPDATE eggs SET step = ?, status = ? WHERE egg_id = ?`,
        [newStep, newStatus, egg.egg_id]
      );

      // 부화 시 pippy 테이블에 팁피 추가 (간단 예시)
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

const PORT = 4000;
app.listen(PORT, () => console.log(`서버 실행 중: ${PORT}`));