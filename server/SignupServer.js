const express = require('express'); // 웹 서버 프레임워크 Express 불러오기
const bcrypt = require('bcrypt');   // 비밀번호 암호화를 위한 bcrypt 라이브러리 불러오기
const { v4: uuidv4 } = require('uuid'); // 전 세계적으로 고유한 식별자(UUID)를 생성하는 함수 불러오기
const pool = require('./db');       // 데이터베이스 연결을 위한 pool 객체 불러오기

const router = express.Router();    // 라우터 객체 생성

// POST 방식으로 회원가입 요청 처리
router.post('/', async (req, res) => {
  const { username, password } = req.body; // 클라이언트가 보낸 아이디와 비밀번호 추출

  // 아이디나 비밀번호가 비어 있는지 검사
  if (!username || !password) {
    return res.status(400).json({ message: '아이디와 비밀번호를 입력해주세요.' }); // 잘못된 요청 응답
  }

  try {
    // 같은 아이디가 이미 존재하는지 확인 (중복 가입 방지)
    const [rows] = await pool.query('SELECT user_id FROM users WHERE username = ?', [username]);
    if (rows.length > 0) {
      return res.status(409).json({ message: '이미 존재하는 아이디입니다.' }); // 중복 아이디 응답
    }

    // 🔐 (1) 비밀번호를 암호화하여 저장 (보안상의 이유로 평문 저장 금지)
    const hashedPassword = await bcrypt.hash(password, 10); // 10번 salt를 적용한 해시값 생성

    // 🔑 (2) UUID를 이용해 유일한 사용자 식별자 생성 (중복 없이 고유한 userId)
    const userId = uuidv4(); // 예: '550e8400-e29b-41d4-a716-446655440000'

    // users 테이블에 사용자 정보 삽입 (userId, 아이디, 암호화된 비밀번호)
    await pool.query(
      'INSERT INTO users (user_id, username, password) VALUES (?, ?, ?)',
      [userId, username, hashedPassword]
    );

    // 성공적으로 등록된 경우, 새로 생성된 userId를 반환
    res.status(201).json({ userId });
  } catch (error) {
    // 예외 발생 시 서버 콘솔에 출력하고 500 오류 응답
    console.error('회원가입 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 라우터 내보내기 (다른 파일에서 이 모듈을 사용할 수 있도록 함)
module.exports = router;