// src/api/image.js
import axios from 'axios';

const ORIGIN = (process.env.REACT_APP_BACKEND_URL || '').replace(/\/+$/, ''); // 예: http://localhost:8080
const API = `${ORIGIN}/api/image`;

const absolutize = (path) => {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    return `${ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`;
};

export const uploadProfileImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await axios.post(`${API}/upload`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    // 서버: { id, imageUrl } 반환
    return { id: data.id, imageUrl: absolutize(data.imageUrl) };
};

export const getProfileImageUrl = async () => {
    try {
        const { data } = await axios.get(`${API}/me`, { withCredentials: true });
        // 서버: { id, imageUrl } 또는 호환 문자열일 수도 있으니 안전 처리
        const url = data?.imageUrl ?? data;
        return absolutize(url); // 절대 URL로 변환 (없으면 null)
    } catch (err) {
        // 이미지 미설정일 때 404/204 → null 반환
        if (err.response?.status === 404 || err.response?.status === 204) return null;
        throw err;
    }
};