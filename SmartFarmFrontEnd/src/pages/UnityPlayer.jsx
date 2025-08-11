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
        }}
      />
    </div>
  );
}

export default UnityPlayer;
