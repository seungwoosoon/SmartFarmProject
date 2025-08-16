// src/api/auth.js
import axios from "axios";

// ✅ Nginx가 /api/* 를 백엔드로 프록시하므로 /api 접두어 사용
const AUTH_BASE = "/api/auth";

export const login = async (loginId, password) => {
  const { data } = await axios.post(
      `${AUTH_BASE}/login`,
      { login: loginId, password },
      { withCredentials: true }
  );
  return data;
};

export const signup = async (userData) => {
  const { data } = await axios.post(`${AUTH_BASE}/join`, userData, {
    withCredentials: true,
  });
  return data;
};

export const checkLogin = async (login) => {
  const { data } = await axios.get(`${AUTH_BASE}/check-login`, {
    params: { login },
    withCredentials: true,
  });
  return data.available;
};

export const logout = async () => {
  await axios.post(`${AUTH_BASE}/logout`, {}, { withCredentials: true });
};

export const getCurrentUser = async () => {
  const { data } = await axios.get(`${AUTH_BASE}/me`, {
    withCredentials: true,
  });
  return data;
};

export const updateProfile = async (profile) => {
  const { data } = await axios.patch(`${AUTH_BASE}/me`, profile, {
    withCredentials: true,
  });
  return data;
};