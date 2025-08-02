// src/api/image.js
import axios from 'axios';

const API_ROOT = process.env.REACT_APP_BACKEND_URL;

export const uploadProfileImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await axios.post(
        `${API_ROOT}/api/images/upload`,
        formData,
        {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" }
        }
    );
    return data;  // { id, imageUrl }
};

export const getProfileImageUrl = async () => {
    const { data } = await axios.get(
        `${API_ROOT}/api/images/me`,
        { withCredentials: true }
    );
    return data;  // { id, imageUrl }
};