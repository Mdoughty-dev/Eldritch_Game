import { useEffect, useRef, useState } from "react";
import { createPhaserGame } from "../game/game";

export default function PhaserCanvas() {
  const containerRef = useRef(null);
  const shellRef = useRef(null);
  const gameRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!gameRef.current) {
      gameRef.current = createPhaserGame(containerRef.current.id);
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);

      if (gameRef.current?.scale) {
        gameRef.current.scale.refresh();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);

      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement && shellRef.current) {
        await shellRef.current.requestFullscreen();
      } else if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen failed:", error);
    }
  };

  return (
    <div
      ref={shellRef}
      style={{
        position: "relative",
        width: "100vw",
        height: "100dvh",
        overflow: "hidden",
        background: "#000",
      }}
    >
      <div
        id="phaser-container"
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      />

      <button
        onClick={toggleFullscreen}
        aria-label="Toggle fullscreen"
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          zIndex: 20,
          width: "44px",
          height: "44px",
          borderRadius: "8px",
          border: "1px solid rgba(255,255,255,0.45)",
          background: "rgba(0,0,0,0.55)",
          color: "#fff",
          fontSize: "20px",
          cursor: "pointer",
        }}
      >
        {isFullscreen ? "×" : "[ ]"}
      </button>
    </div>
  );
}