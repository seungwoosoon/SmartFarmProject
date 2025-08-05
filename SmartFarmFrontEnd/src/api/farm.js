// src/api/farm.js
import axios from 'axios';

const API_ROOT = process.env.REACT_APP_BACKEND_URL;
const FARM_BASE = `${API_ROOT}/api/farm-product`;

/**
 * 세싹 등록 API 호출
 * @param {number} numofshelf - 몇 번째 선반
 * @param {number} numofshelffloor - 선반의 몇 번째 줄
 * @param {number} numofpot - 줄의 몇 번째 칸
 * @returns {Promise<object>} - 서버 응답 데이터
 */
export const addSeedling = async ({ numofshelf, numofshelffloor, numofpot }) => {
    const { data } = await axios.post(
        FARM_BASE,
        {
            numofshelf,
            numofshelffloor,
            numofpot,
            exp: 0,
            status: "NORMAL",
        },
        { withCredentials: true }
    );
    return data;
};

/**
 * 세싹 전체 상태 조회 API 호출 (GET /api/auth/structure)
 * @returns {Promise<object>} - { seedlings: [...] }
 */
export const getSeedlings = async () => {
    const { data } = await axios.get(STRUCTURE_URL, {
        withCredentials: true, // ✅ 세션 쿠키 포함
    });
    return data;
};
