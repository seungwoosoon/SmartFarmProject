// src/pages/UnityPlayer.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Unity, useUnityContext } from "react-unity-webgl";
import { getSeedlings } from "../api/farm";
import "../App.css";

const ROWS_PER_SHELF = 4;
const COLS_PER_ROW = 5;
// 현재 씬은 Shelf_0만 보여줌 (원하면 바꿔도 됨)
const ACTIVE_SHELF = 0;

function UnityPlayer() {
<<<<<<< HEAD
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { unityProvider } = useUnityContext({
    loaderUrl: "/Build/web.loader.js",
    dataUrl: "/Build/web.data",
    frameworkUrl: "/Build/web.framework.js",
    codeUrl: "/Build/web.wasm",
  });

  if (!unityProvider) return <div>Loading...</div>;

  return (
    <div
      className="unityplayer-container"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e0ffc6 0%, #b7ffd8 100%)",
        padding: 0,
        position: "relative", // 모바일에서 back 버튼 고정의 기준
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto", paddingTop: 32 }}>
        {/* ⬇️ 모바일에서만 위치 고정될 버튼 (PC는 기존 스타일 유지) */}
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

        {/* ⬇️ 이 블록만 모바일에서 버튼 높이만큼 아래로 내림 */}
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

          {/* 카드 프레임 */}
          <div
            className="unity-card"
            style={{
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 4px 24px rgba(180,200,230,0.18)",
              padding: 12,
            }}
          >
            {/* 16:9 비율 유지 래퍼 */}
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
=======
    const navigate = useNavigate();
    const { t } = useTranslation();

    const { unityProvider, sendMessage, isLoaded } = useUnityContext({
        loaderUrl: "/Build/web.loader.js",
        dataUrl: "/Build/web.data",
        frameworkUrl: "/Build/web.framework.js",
        codeUrl: "/Build/web.wasm",
    });

    // 1) 백엔드 → JSON 변환 → Unity로 전송
    useEffect(() => {
        if (!isLoaded) return;

        const fetchAndPushAll = async () => {
            try {
                const data = await getSeedlings(); // [{ position{...}, status, plant, ... }]
                const payload = buildGridPayloadFromSeedlings(data);

                // 씬 초기화 시간을 조금 주면 NetworkBridge 미탐 방지됨
                setTimeout(() => {
                    sendGridPayloadChunked(sendMessage, payload);
                }, 600);
            } catch (err) {
                console.error("Failed to load seedlings for Unity:", err);
            }
        };

        fetchAndPushAll();
    }, [isLoaded, sendMessage]);

    // 콘솔에서 수동 테스트용
    useEffect(() => {
        if (!isLoaded) return;
        window.__sendUnity = (cells) =>
            sendMessage("NetworkBridge", "OnGrid", JSON.stringify({ cells }));
        return () => { delete window.__sendUnity; };
    }, [isLoaded, sendMessage]);

    if (!unityProvider) return <div>Loading...</div>;

    return (
        <div
            className="unityplayer-container"
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #e0ffc6 0%, #b7ffd8 100%)",
                padding: "0",
            }}
        >
            <div style={{ maxWidth: 900, margin: "0 auto", paddingTop: 32 }}>
                <button
                    className="back-btn"
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

                <div
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
                    style={{
                        background: "#fff",
                        borderRadius: 16,
                        boxShadow: "0 4px 24px rgba(180,200,230,0.18)",
                        padding: 0,
                        minHeight: 600,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Unity unityProvider={unityProvider} style={{ width: 960, height: 600 }} />
                </div>
            </div>
        </div>
    );
>>>>>>> 97f9fab (fix?)
}

export default UnityPlayer;

/** ---------- Helpers ---------- **/

// 백엔드 → Unity(2D)용 셀 배열로 평탄화
function buildGridPayloadFromSeedlings(raw) {
    const seedlings = raw?.seedlings || raw || [];

    // 기본: 전체를 EMPTY로 채움
    const cells = Array.from({ length: ROWS_PER_SHELF * COLS_PER_ROW }, (_, i) => {
        const row = Math.floor(i / COLS_PER_ROW);
        const col = i % COLS_PER_ROW;
        return {
            row, col,
            status: "EMPTY", plant: "EMPTY",
            exp: 0, ph: 0, temperature: 0,
            lightStrength: 0, ttsDensity: 0, humidity: 0,
        };
    });

    // 실제 데이터 덮어쓰기 (현재는 ACTIVE_SHELF만 사용)
    for (const s of seedlings) {
        const pos = s.position || {};
        const shelf = pos.numOfShelf ?? 0;
        const row   = pos.numOfShelfFloor ?? 0;
        const col   = pos.numOfPot ?? 0;

        if (shelf !== ACTIVE_SHELF) continue;
        if (row < 0 || row >= ROWS_PER_SHELF || col < 0 || col >= COLS_PER_ROW) continue;

        const idx = row * COLS_PER_ROW + col;
        cells[idx] = {
            row, col,
            status: s.status ?? "NORMAL",
            plant:  s.plant  ?? "SPROUT",
            exp: s.exp ?? 0,
            ph: s.ph ?? 0,
            temperature: s.temperature ?? 0,
            lightStrength: s.lightStrength ?? 0,
            ttsDensity: s.ttsDensity ?? 0,
            humidity: s.humidity ?? 0,
            name: s.name ?? undefined,
        };
    }

    // Unity는 {cells:[...]} 형식만 받음
    return { cells };
}

// (payload가 작으면 OnGrid로 한 번에 보냄. 커지면 Begin/Chunk/End 사용)
function sendGridPayloadChunked(sendMessage, payload) {
    const json = JSON.stringify(payload);
    const CHUNK = 200_000;

    if (json.length <= CHUNK) {
        sendMessage("NetworkBridge", "OnGrid", json);
        return;
    }
    // ⚠️ 유니티에 OnGridBegin/OnGridChunk/OnGridEnd 구현이 없다면 CHUNK를 크게 두면 항상 단건 전송됨
    sendMessage("NetworkBridge", "OnGridBegin", JSON.stringify({
        total: json.length,
        chunkSize: CHUNK
    }));
    for (let i = 0; i < json.length; i += CHUNK) {
        const part = json.slice(i, i + CHUNK);
        sendMessage("NetworkBridge", "OnGridChunk", part);
    }
    sendMessage("NetworkBridge", "OnGridEnd", "");
}