import { useEffect, useState } from "react";
import { io } from "socket.io-client";

// this alloows connectin to backend
const socket = io("http://localhost:3000");

export default function SocketTesting() {
  const [step, setStep] = useState("choose-mode"); // the options are: setup, lobby, in-game, ended
  const [mode, setMode] = useState(""); // options: solo or multiplayer
  const [name, setName] = useState("");
  const [userId] = useState("user_" + Math.floor(Math.random() * 9999));
  const [characterId, setCharacterId] = useState(1);
  const [roomCode, setRoomCode] = useState("");
  const [players, setPlayers] = useState([]);
  const [gameData, setGameData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [hasAnswered, setHasAnswered] = useState(false);

  // here I listent to all the custom events the backend is sending
  useEffect(() => {
    socket.on("connect", () => console.log("Connected:", socket.id));

    socket.on("lobbyUpdated", (payload) => {
      setRoomCode(payload.roomCode);
      setPlayers(payload.players);
      setStep("lobby");
    });

    socket.on("roundStarted", (payload) => {
      setGameData(payload);
      setHasAnswered(false);
      setStep("in-game");
    });

    socket.on("roundResult", (payload) => {
      console.log("Round result received:", payload);
    });

    socket.on("gameEnded", (payload) => {
      alert(`Game Over!\nResult: ${payload.result}\nReason: ${payload.reason}`);
      setStep("ended");
    });

    socket.on("joinError", (err) => alert(err.message));
    socket.on("startError", (err) => alert(err.message));
    socket.on("answerError", (err) => alert(err.message));

    return () => {
      socket.off("joinError");
      socket.off("answerError");
      socket.off("connect");
      socket.off("lobbyUpdated");
      socket.off("roundStarted");
      socket.off("roundResult");
      socket.off("gameEnded");
      socket.off("startError");
    };
  }, []);

  // SOLO MODE: basically skip the lobby
  useEffect(() => {
    if (step === "lobby" && mode === "solo") {
      socket.emit("startGame");
    }
  }, [step, mode]);

  // timer logic based on deadline timestampe sent by BE
  useEffect(() => {
    const deadline = gameData?.gameState?.roundDeadline;
    if (!deadline) return;

    const timerId = setInterval(() => {
      const msRemaining = deadline - Date.now();
      const secondsRemaining = Math.max(0, Math.floor(msRemaining / 1000));
      setTimeLeft(secondsRemaining);

      if (secondsRemaining <= 0) clearInterval(timerId);
    }, 100);

    return () => clearInterval(timerId);
  }, [gameData]);

  // BUTTONs HANDLER FUNCTIONS

  function selectMode(selectedMode) {
    setMode(selectedMode);
    setStep("setup");
  }

  function handleStartSolo(e) {
    e.preventDefault();
    socket.emit("joinRoom", { name, userId, roomCode: null, characterId });
  }
  // here roomCode is set to null to signal BE that it neds to create a new room instad of joining one

  function handleCreateMultiplayer(e) {
    e.preventDefault();
    socket.emit("joinRoom", { name, userId, roomCode: null, characterId });
  }
  // here roomCode is set to null to signal BE that it neds to create a new room instad of joining one

  function handleJoinMultiplayer(e) {
    e.preventDefault();
    socket.emit("joinRoom", {
      name,
      userId,
      roomCode: roomCode.trim().toUpperCase(),
      characterId,
    });
  }

  function submitAnswer(key) {
    if (hasAnswered) return;
    setHasAnswered(true);
    socket.emit("submitAnswer", {
      questionId: gameData.question.id,
      answer: key,
    });
  }

  return (
    <div className="socket-testing">
      {/* SOLO - MULTIPLAYER CHOICE SCREEN */}
      {step === "choose-mode" && (
        <div>
          <h1>Choose Game Mode</h1>
          <button onClick={() => selectMode("solo")}>Play Solo</button>
          <button onClick={() => selectMode("multiplayer")}>
            Play Multiplayer
          </button>
        </div>
      )}

      {/* SET SCREEN character and name */}
      {step === "setup" && (
        <div>
          <h1>{mode === "solo" ? "Solo Setup" : "Multiplayer Setup"}</h1>

          <label>Select Character: </label>
          <select
            value={characterId}
            onChange={(e) => setCharacterId(Number(e.target.value))}
          >
            <option value={1}>The Scholar</option>
            <option value={2}>The Investigator</option>
            <option value={3}>The Occultist</option>
            <option value={4}>The Veteran</option>
          </select>
          <br />
          <br />

          {mode === "solo" ? (
            <form onSubmit={handleStartSolo}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                required
              />
              <button type="submit">Start Solo Game</button>
            </form>
          ) : (
            <div>
              <form onSubmit={handleCreateMultiplayer}>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  required
                />
                <button type="submit">Create New Room</button>
              </form>
              <br />
              <form onSubmit={handleJoinMultiplayer}>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  required
                />
                <input
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  placeholder="Room Code"
                  required
                />
                <button type="submit">Join Existing Room</button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* LOBBY SCREEN N.B. only shown in multuplayer mode */}
      {step === "lobby" && mode === "multiplayer" && (
        <div>
          <h1>Lobby</h1>
          <p>
            Room Code: <strong>{roomCode}</strong>
          </p>
          <h3>Players in room:</h3>
          <ul>
            {players.map((p) => (
              <li key={p.userId}>
                {p.name} - {p.character.name}{" "}
                {p.userId === userId ? "(You)" : ""}
              </li>
            ))}
          </ul>
          <button onClick={() => socket.emit("startGame")}>Start Game</button>
        </div>
      )}

      {/* GAME SCREEN */}
      {step === "in-game" && gameData && (
        <div>
          <h1>Battle Phase</h1>

          <div>
            <h3>Team HP: {gameData.gameState.teamHp}</h3>
            <h3>
              {gameData.monster.name} HP: {gameData.monster.hp} /{" "}
              {gameData.monster.maxHp}
            </h3>
            <p>
              Time Left: {timeLeft}s | Round: {gameData.gameState.roundNumber}
            </p>
          </div>

          <hr />

          <h2>{gameData.question.prompt}</h2>
          <div>
            {["a", "b", "c", "d"].map((key) => (
              <button
                key={key}
                onClick={() => submitAnswer(key)}
                disabled={hasAnswered}
              >
                {key.toUpperCase()}: {gameData.question.options[key]}
              </button>
            ))}
          </div>

          {hasAnswered && <p>Waiting for other players...</p>}
        </div>
      )}

      {/* game over screwn */}
      {step === "ended" && (
        <div>
          <h1>Game Over</h1>
          <p>Refresh the page to play again</p>
        </div>
      )}

      {/* Debug box with payload info, it shows what the BE is sending and making available*/}
      <hr />
      <div className="debug-box">
        <h3>Debug Data </h3>
        <p>This shows exactly what data the FE currently has access to:</p>
        <pre>
          {JSON.stringify(
            { step, mode, roomCode, userId, hasAnswered, players, gameData },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
}
