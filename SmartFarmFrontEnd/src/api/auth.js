// src/api/auth.js
import axios from 'axios';

// Spring Boot 서버 주소
//const API_BASE_URL = 'http://localhost:8080';
const API_BASE_URL = "http://localhost:8080/api/auth";

// 로그인 요청
export const login = async (loginId, password) => {
  const response = await axios.post(`${API_BASE_URL}/login`, {
    login: loginId,
    password: password,
  }, { withCredentials: true }); // 👉 쿠키 기반 세션 유지 시 필요
  return response.data;
};

// 회원가입 요청
export const signup = async (userData) => {
  const response = await axios.post(`${API_BASE_URL}/join`, userData, {
    withCredentials: true,
  });
  return response.data;
};

// 로그아웃 요청
export const logout = async () => {
  await axios.post(`${API_BASE_URL}/logout`, {}, {
    withCredentials: true, // 세션 기반이면 필수
  });
};
