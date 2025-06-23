const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('./db');
const { setUser } = require('./TypingTracker');

const router = express.Router();

router.post('/', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: '아이디와 비밀번호를 입력해주세요.' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT user_id, password FROM users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: '존재하지 않는 아이디입니다.' });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: '비밀번호가 올바르지 않습니다.' });
    }

    setUser(user.user_id);  // 핵심: TypingTracker에 사용자 등록
    res.status(200).json({ userId: user.user_id });
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;  