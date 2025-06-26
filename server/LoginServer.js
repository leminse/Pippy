const express = require('express');      
const bcrypt = require('bcrypt');     
const pool = require('./db');           
const { setUser } = require('./TypingTracker');
const router = express.Router();          

// 로그인 요청 처리 (POST 방식)
router.post('/', async (req, res) => {
  const { username, password } = req.body; 

  // 아이디나 비밀번호가 비어 있으면 요청 거부
  if (!username || !password) {
    return res.status(400).json({ message: '아이디와 비밀번호를 입력해주세요.' });
  }

  try {
    // 사용자가 입력한 아이디로 DB에서 해당 유저 조회
    const [rows] = await pool.query(
      'SELECT user_id, password FROM users WHERE username = ?',
      [username]
    );

    // 사용자가 존재하지 않으면 로그인 실패 응답
    if (rows.length === 0) {
      return res.status(401).json({ message: '존재하지 않는 아이디입니다.' });
    }

    const user = rows[0]; 

    // bcrypt로 비밀번호 비교
    // bcrypt란 비밀번호를 안전하게 저장하기 위한 암호화(해싱) 알고리즘
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: '비밀번호가 올바르지 않습니다.' });
    }

    // ✅ 로그인 성공 시 → TypingTracker에 현재 유저 ID 등록
    setUser(user.user_id); // 키보드 입력 감지를 위한 핵심 연동 지점

    // 로그인 성공 응답 (프론트엔드에서 userId를 저장해서 사용)
    res.status(200).json({ userId: user.user_id });
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;