// src/api/farm.js
import axios from 'axios';

// ✅ Nginx 프록시를 통해 /api/farm 으로 요청
const FARM_BASE = `/api/farm`;

/**
 * 세싹 등록 API 호출
 */
export const addSeedling = async ({ numOfShelf, numOfShelfFloor, numOfPot }) => {
    console.log("전송 요청 데이터 확인:", {
        shelfPosition: numOfShelf,
        floorPosition: numOfShelfFloor,
        potPosition: numOfPot,
    });
    const { data } = await axios.post(
        `${FARM_BASE}/addSeedling`,
        {
            shelfPosition: numOfShelf,
            floorPosition: numOfShelfFloor,
            potPosition: numOfPot,
        },
        { withCredentials: true }
    );
    return data;
};

/**
 * 세싹 삭제 API 호출
 */
export const deleteSeedling = async ({ numOfShelf, numOfShelfFloor, numOfPot }) => {
    const { data } = await axios.post(
        `${FARM_BASE}/deleteSeedling`,
        {
            shelfPosition: numOfShelf,
            floorPosition: numOfShelfFloor,
            potPosition: numOfPot,
        },
        { withCredentials: true }
    );
    return data;
};

/**
 * 세싹 전체 상태 조회 API 호출
 */
export const getSeedlings = async () => {
    const { data } = await axios.get(`${FARM_BASE}/getSeedlings`, {
        withCredentials: true, // ✅ 세션 쿠키 포함
    });
    return data;
};