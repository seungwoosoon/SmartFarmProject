// src/pages/UnityPlayer.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Unity, useUnityContext } from "react-unity-webgl";
import { getSeedlings } from "../api/farm";
import "../App.css";

const ROWS_PER_SHELF = 4;
const COLS_PER_ROW = 5;
const ACTIVE_SHELF = 0;
const POLL_MS = 5000; // ✅ 5초마다 폴링

function UnityPlayer() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const { unityProvider, sendMessage, isLoaded } = useUnityContext({
        loaderUrl: "/Build/web.loader.js",
        dataUrl: "/Build/web.data",
        frameworkUrl: "/Build/web.framework.js",
        codeUrl: "/Build/web.wasm",
    });

    // ✅ 처음 로드 + 주기적으로 데이터 갱신
    useEffect(() => {
        if (!isLoaded) return;

        let cancelled = false;
        let timerId;

        const fetchAndPushAll = async () => {
            try {
                const data = await getSeedlings(); // [{ position{...}, status, plant, ... }]
                if (cancelled) return;
                const payload = buildGridPayloadFromSeedlings(data);
                sendGridPayloadChunked(sendMessage, payload);
            } catch (err) {
                console.error("Failed to load seedlings for Unity:", err);
            }
        };

        // 최초 실행
        fetchAndPushAll();
        // 주기 실행
        timerId = setInterval(fetchAndPushAll, POLL_MS);

        return () => {
            cancelled = true;
            if (timerId) clearInterval(timerId);
        };
    }, [isLoaded, sendMessage]);

    // 콘솔에서 수동 테스트용
    useEffect(() => {
        if (!isLoaded) return;
        window.__sendUnity = (cells) =>
            sendMessage("NetworkBridge", "OnGrid", JSON.stringify({ cells }));
        return () => {
            delete window.__sendUnity;
        };
    }, [isLoaded, sendMessage]);

    if (!unityProvider) return <div>Loading...</div>;

    return (
        <div
            className="unityplayer-container"
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #e0ffc6 0%, #b7ffd8 100%)",
                padding: 0,
                position: "relative",
            }}
        >
            <div style={{ maxWidth: 900, margin: "0 auto", paddingTop: 32 }}>
                <button
                    className="back-btn unity-back-btn"
                    style={{
                        marginBottom: 24,
                        background: "#fff",
                        border: "1px solid #b5c6e0",
                        borderRadius: 8,
                        padding: "8px 18px",
                        fontSize: 18,
                        cursor: "pointer",
                        color: "#3b4a6b",
                        boxShadow: "0 2px 8px rgba(180,200,230,0.08)",
                    }}
                    onClick={() => navigate(-1)}
                >
                    ← {t("button.back")}
                </button>

                <div className="unity-content">
                    <div
                        className="unityplayer-title"
                        style={{
                            fontSize: 32,
                            fontWeight: 700,
                            color: "#3b4a6b",
                            marginBottom: 12,
                            textAlign: "center",
                            letterSpacing: "1px",
                        }}
                    >
                        {t("plantTwin")}
                    </div>

                    <div
                        className="unityplayer-desc"
                        style={{
                            textAlign: "center",
                            color: "#4b5d2a",
                            fontSize: 18,
                            marginBottom: 28,
                            fontWeight: 400,
                        }}
                    >
                        {t("plantTwinDesc")}
                    </div>

                    <div
                        className="unity-card"
                        style={{
                            background: "#fff",
                            borderRadius: 16,
                            boxShadow: "0 4px 24px rgba(180,200,230,0.18)",
                            padding: 12,
                        }}
                    >
                        <div className="unity-player-wrapper">
                            <Unity
                                unityProvider={unityProvider}
                                className="unity-player-canvas"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UnityPlayer;

/** ---------- Helpers ---------- **/
function buildGridPayloadFromSeedlings(raw) {
    const items = Array.isArray(raw) ? raw : (Array.isArray(raw?.seedlings) ? raw.seedlings : []);
    const cells = Array.from({ length: ROWS_PER_SHELF * COLS_PER_ROW }, (_, i) => {
        const row = Math.floor(i / COLS_PER_ROW), col = i % COLS_PER_ROW;
        return { row, col, status: "EMPTY", plant: "EMPTY", exp: 0, ph: 0, temperature: 0, lightStrength: 0, ttsDensity: 0, humidity: 0 };
    });

    // 상태 enum → 축약 코드 매핑
    const STATUS_CODE_MAP = {
        "NORMAL": "N",
        "WARNING": "W",
        "EMPTY": "E",
        "GRAYMOLD": "GM",
        "POWDERYMILDEW": "PM",
        "NITROGENDEFICIENCY": "ND",
        "PHOSPHROUSDEFICIENCY": "PD",
        "POTASSIUMDEFICIENCY": "PKD"
    };

    const up = s => (s ?? "").trim().toUpperCase();

    for (const s of items) {
        const pos = s.position || {};
        const shelf = pos.shelf?.index ?? pos.shelfIndex ?? pos.numOfShelf ?? 0;
        if (shelf !== ACTIVE_SHELF) continue;

        const row = pos.floor?.index ?? pos.shelfFloor?.index ?? pos.numOfShelfFloor ?? pos.row ?? 0;
        const col = pos.pot?.index   ?? pos.numOfPot         ?? pos.col            ?? 0;
        if (row < 0 || row >= ROWS_PER_SHELF || col < 0 || col >= COLS_PER_ROW) continue;

        const rawStatus = up(s.status ?? "NORMAL");
        const code = STATUS_CODE_MAP[rawStatus] ?? "N";  // 축약코드 없으면 NORMAL("N") 처리
        const plant = up(s.plant ?? "SPROUT");

        const idx = row * COLS_PER_ROW + col;
        cells[idx] = {
            row, col,
            status: code,                         // 👈 축약코드만 보내기
            plant: plant === "EMPTY" ? "EMPTY" : plant,
            exp: Number(s.exp ?? 0) || 0,
            ph: Number(s.ph ?? 0) || 7,
            temperature: Number(s.temperature ?? 0) || 25,
            lightStrength: Number(s.lightStrength ?? 0) || 1500,
            ttsDensity: Number(s.ttsDensity ?? 0) || 200,
            humidity: Number(s.humidity ?? 0) || 10,
            name: s.name,
        };
    }

    return { cells };
}
function sendGridPayloadChunked(sendMessage, payload) {
    const json = JSON.stringify(payload);
    const CHUNK = 200_000;

    if (json.length <= CHUNK) {
        sendMessage("NetworkBridge", "OnGrid", json);
        return;
    }
    sendMessage(
        "NetworkBridge",
        "OnGridBegin",
        JSON.stringify({
            total: json.length,
            chunkSize: CHUNK,
        })
    );
    for (let i = 0; i < json.length; i += CHUNK) {
        const part = json.slice(i, i + CHUNK);
        sendMessage("NetworkBridge", "OnGridChunk", part);
    }
    sendMessage("NetworkBridge", "OnGridEnd", "");
}