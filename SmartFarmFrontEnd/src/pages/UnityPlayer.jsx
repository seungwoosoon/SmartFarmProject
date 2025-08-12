import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Unity, useUnityContext } from "react-unity-webgl";
import "../App.css";

function UnityPlayer() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { unityProvider } = useUnityContext({
    loaderUrl: "/Build/web.loader.js",
    dataUrl: "/Build/web.data",
    frameworkUrl: "/Build/web.framework.js",
    codeUrl: "/Build/web.wasm",
  });

  if (!unityProvider) {
    return <div>Loading...</div>;
  }

  return (
    <>
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
            {t(
              "plantTwinDesc",
            )}
          </div>
          {/* 유니티 뷰어/iframe/컴포넌트 영역 */}
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
            <Unity
              unityProvider={unityProvider}
              style={{
                width: "960px",
                height: "600px",
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default UnityPlayer;
