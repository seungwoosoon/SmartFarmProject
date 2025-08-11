import React from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import "../App.css";

function UnityPlayer() {
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
    <div className="unity-container">
      <Unity
        unityProvider={unityProvider}
        style={{
          width: "960px",
          height: "600px",
          border: "2px solid #333",
          background: "#1F1F1F",
        }}
      />
    </div>
  );
}

export default UnityPlayer;
