// src/components/UnityPlayer.jsx
import { useEffect, useRef, useState } from "react";

export default function UnityPlayer() {
  const canvasRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let unityInstance = null;
    let script = document.createElement("script");
    // 로더 스크립트 경로
    script.src = process.env.PUBLIC_URL + "/unity/Build/web.loader.js";
    script.async = true;

    script.onload = () => {
      // window.createUnityInstance는 로더가 주입함
      window
        .createUnityInstance(
          canvasRef.current,
          {
            dataUrl: process.env.PUBLIC_URL + "/unity/Build/web.data",
            frameworkUrl: process.env.PUBLIC_URL + "/unity/Build/web.framework.js",
            codeUrl: process.env.PUBLIC_URL + "/unity/Build/web.wasm",
            streamingAssetsUrl: process.env.PUBLIC_URL + "/unity/StreamingAssets", // 있으면
            companyName: "YourCompany",
            productName: "YourProduct",
            productVersion: "1.0",
          },
          (p) => setProgress(p) // 0~1
        )
        .then((inst) => {
          unityInstance = inst;
          // 필요하면 전역 접근용
          window.unityInstance = inst;
        })
        .catch((err) => {
          console.error("Unity load failed:", err);
        });
    };

    document.body.appendChild(script);

    return () => {
      // 언마운트 시 정리
      if (unityInstance && unityInstance.Quit) {
        unityInstance.Quit().catch(() => {});
      }
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div style={{ width: "100%", maxWidth: 1200, margin: "0 auto" }}>
      {/* 로딩 UI(직접 커스터마이즈) */}
      {progress < 1 && (
        <div style={{ marginBottom: 8 }}>
          Loading… {Math.round(progress * 100)}%
          <div style={{ height: 6, background: "#eee" }}>
            <div
              style={{
                width: `${progress * 100}%`,
                height: "100%",
                background: "#4A90E2",
                transition: "width .2s",
              }}
            />
          </div>
        </div>
      )}

      {/* Unity가 그릴 캔버스 */}
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          aspectRatio: "16 / 9", // 필요에 맞게
          background: "#000",
        }}
        tabIndex={1}
      />
    </div>
  );
}
