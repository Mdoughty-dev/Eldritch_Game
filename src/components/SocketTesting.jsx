import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

export default function SocketTesting() {
  const [step, setStep] = useState("choose-mode");
  const [mode, setMode] = useState("");
  const [name, setName] = useState("");
  const [userId] = useState("user_" + Math.floor(Math.random() * 9999));
  const [characterId, setCharacterId] = useState(1);
  const [roomCode, setRoomCode] = useState("");
  const [players, setPlayers] = useState([]);
  const [hostUserId, setHostUserId] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [lastRoundResult, setLastRoundResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [waitingForReady, setWaitingForReady] = useState(false);

  const isHost = userId === hostUserId;

  useEffect(() => {
    socket.on("connect", () => console.log("Connected:", socket.id));

    socket.on("lobbyUpdated", (payload) => {
      setRoomCode(payload.roomCode);
      setPlayers(payload.players);
      setHostUserId(payload.hostUserId);
      setStep("lobby");
    });

    socket.on("roundStarted", (payload) => {
      setGameData(payload);
      setLastRoundResult(null);
      setHasAnswered(false);
      setWaitingForReady(false);
      setStep("in-game");
    });

    socket.on("roundResult", (payload) => {
      setLastRoundResult(payload);
      setWaitingForReady(true);
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

  useEffect(() => {
    if (step === "lobby" && mode === "solo") {
      socket.emit("startGame");
    }
  }, [step, mode]);

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

  function handleStartSolo(e) {
    e.preventDefault();
    socket.emit("joinRoom", { name, userId, roomCode: null, characterId });
  }

  function handleCreateMultiplayer(e) {
    e.preventDefault();
    socket.emit("joinRoom", { name, userId, roomCode: null, characterId });
  }

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

  function sendClientReady() {
    socket.emit("clientReadyForNextRound");
    setWaitingForReady(false);
  }

  return (
    <div className="socket-testing">
      {step === "choose-mode" && (
        <div>
          <h1>Choose Game Mode</h1>
          <button
            onClick={() => {
              setMode("solo");
              setStep("setup");
            }}
          >
            Play Solo
          </button>
          <button
            onClick={() => {
              setMode("multiplayer");
              setStep("setup");
            }}
          >
            Play Multiplayer
          </button>
        </div>
      )}

      {step === "setup" && (
        <div>
          <h1>{mode === "solo" ? "Solo Setup" : "Multiplayer Setup"}</h1>
          <label>Select Character: </label>
          <select
            value={characterId}
            onChange={(e) => setCharacterId(Number(e.target.value))}
          >
            <option value={1}>Denis McCload</option>
            <option value={2}>Greystaff</option>
            <option value={3}>Patris Deathstare</option>
            <option value={4}>Unknown</option>
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

      {step === "lobby" && mode === "multiplayer" && (
        <div>
          <h1>Lobby</h1>
          <p>
            Room Code: <strong>{roomCode}</strong>
          </p>
          <h3>Players:</h3>
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

      {step === "in-game" && gameData && (
        <div>
          <h1>Battle Phase</h1>
          <h3>
            Team HP: {gameData.gameState.teamHp} /{" "}
            {gameData.gameState.maxTeamHp} | Monster HP: {gameData.monster.hp} /{" "}
            {gameData.monster.maxHp}
          </h3>
          <p>
            Time Left: {timeLeft}s | Round: {gameData.gameState.roundNumber}
          </p>

          {lastRoundResult && (
            <div
              style={{ background: "#222", padding: "10px", margin: "10px 0" }}
            >
              <h4>
                Last Round Result:{" "}
                {lastRoundResult.isNextStage ? "🐉 NEW MONSTER" : ""}
              </h4>
              <p>Correct Option: {lastRoundResult.correctOption}</p>
              <p>Team Damage Taken: {lastRoundResult.teamDamageTaken}</p>
              <p>Monster Damage Taken: {lastRoundResult.monsterDamageTaken}</p>

              {waitingForReady && isHost && (
                <button onClick={sendClientReady} style={{ marginTop: "8px" }}>
                  [HOST] Send clientReadyForNextRound
                </button>
              )}
              {waitingForReady && !isHost && (
                <p>Waiting for host to trigger next round...</p>
              )}
            </div>
          )}

          <hr />
          <h2>{gameData.question.prompt}</h2>
          {["a", "b", "c", "d"].map((key) => (
            <button
              key={key}
              onClick={() => submitAnswer(key)}
              disabled={hasAnswered}
            >
              {key.toUpperCase()}: {gameData.question.options[key]}
            </button>
          ))}
          {hasAnswered && <p>Waiting for others...</p>}
        </div>
      )}

      {step === "ended" && (
        <div>
          <h1>Game Over</h1>
          <button onClick={() => window.location.reload()}>Play Again</button>
        </div>
      )}

      <div className="debug-box">
        <h3>Debug Data</h3>
        <pre>
          {JSON.stringify(
            {
              step,
              userId,
              hostUserId,
              isHost,
              roomCode,
              waitingForReady,
              gameData: gameData ? "Present" : "None",
              lastRoundResult: !!lastRoundResult,
              isNextStage: lastRoundResult?.isNextStage ?? false,
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
}
