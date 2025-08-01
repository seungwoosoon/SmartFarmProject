// src/api/image.js

import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

// 🔼 프로필 이미지 업로드
export const uploadProfileImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(`${API_BASE_URL}/images/upload`, formData, {
        withCredentials: true,
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });

    return response.data;  // ← 문자열(URL) 그대로 반환
};

// 🔽 프로필 이미지 URL 가져오기
export const getProfileImageUrl = async () => {
    const response = await axios.get(`${API_BASE_URL}/images/me`, {
        withCredentials: true,
    });
    return response.data;  // ← .data 자체가 문자열
};