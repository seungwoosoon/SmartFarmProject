// src/api/auth.js
import axios from 'axios';

const API_BASE_URL = "http://localhost:8080/api/auth";

// 로그인 요청
export const login = async (loginId, password) => {
  const response = await axios.post(`${API_BASE_URL}/login`, {
    login: loginId,
    password: password,
  }, { withCredentials: true });
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
    withCredentials: true,
  });
};

// 현재 로그인한 사용자 정보 요청
export const getCurrentUser = async () => {
  const response = await axios.get(`${API_BASE_URL}/me`, {
    withCredentials: true,
  });
  return response.data;
};
