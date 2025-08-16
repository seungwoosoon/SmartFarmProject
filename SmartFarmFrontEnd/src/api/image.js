// src/api/image.js
import axios from 'axios';

const API = `/api/image`;

/**
 * 프로필 이미지 업로드
 */
export const uploadProfileImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await axios.post(`${API}/upload`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    // 서버: { id, imageUrl } 반환
    return data;
};

/**
 * 현재 로그인한 사용자의 프로필 이미지 URL 가져오기
 */
export const getProfileImageUrl = async () => {
    try {
        const { data } = await axios.get(`${API}/me`, { withCredentials: true });
        return data?.imageUrl ?? data ?? null;
    } catch (err) {
        if (err.response?.status === 404 || err.response?.status === 204) return null;
        throw err;
    }
};