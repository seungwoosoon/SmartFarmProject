// src/api/auth.js
import axios from 'axios';

const API_ROOT = process.env.REACT_APP_BACKEND_URL;
const AUTH_BASE = `${API_ROOT}/api/auth`;

export const login = async (loginId, password) => {
  const { data } = await axios.post(
      `${AUTH_BASE}/login`,
      { login: loginId, password },
      { withCredentials: true }
  );
  return data;
};

export const signup = async (userData) => {
  const { data } = await axios.post(
      `${AUTH_BASE}/join`,
      userData,
      { withCredentials: true }
  );
  return data;
};

export const logout = async () => {
  await axios.post(
      `${AUTH_BASE}/logout`,
      {},
      { withCredentials: true }
  );
};

export const getCurrentUser = async () => {
  const { data } = await axios.get(
      `${AUTH_BASE}/me`,
      { withCredentials: true }
  );
  return data;
};