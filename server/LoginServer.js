const express = require('express');       // Express 웹 프레임워크 불러오기
const bcrypt = require('bcrypt');         // 비밀번호 암호화/비교용 bcrypt 모듈 불러오기
const pool = require('./db');             // DB 연결을 위한 커넥션 풀 불러오기
const { setUser } = require('./TypingTracker'); // ★ TypingTracker 모듈에서 유저 등록 함수 불러오기

const router = express.Router();          // 라우터 객체 생성

// 로그인 요청 처리 (POST 방식)
router.post('/', async (req, res) => {
  const { username, password } = req.body; // 요청에서 아이디와 비밀번호 추출

  // 아이디나 비밀번호가 비어 있으면 요청 거부
  if (!username || !password) {
    return res.status(400).json({ message: '아이디와 비밀번호를 입력해주세요.' });
  }

  try {
    // 1단계: 사용자가 입력한 아이디로 DB에서 해당 유저 조회
    const [rows] = await pool.query(
      'SELECT user_id, password FROM users WHERE username = ?',
      [username]
    );

    // 사용자가 존재하지 않으면 로그인 실패 응답
    if (rows.length === 0) {
      return res.status(401).json({ message: '존재하지 않는 아이디입니다.' });
    }

    const user = rows[0]; // 유저 정보 추출

    // ★ 2단계: bcrypt로 비밀번호 비교 (입력값 vs 해시된 DB 값)
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: '비밀번호가 올바르지 않습니다.' });
    }

    // ★★★ 3단계: 로그인 성공 시 → TypingTracker에 현재 유저 ID 등록
    setUser(user.user_id); // ★ 이 줄이 키보드 입력 감지를 위한 핵심 연동 지점입니다.

    // 로그인 성공 응답 (프론트엔드에서 userId를 저장해서 사용)
    res.status(200).json({ userId: user.user_id });
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 외부에서 이 라우터 사용 가능하도록 내보내기
module.exports = router;