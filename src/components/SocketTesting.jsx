import { useEffect, useState } from "react";
import { io } from "socket.io-client";
const socket = io("http://localhost:3000");

export default function SocketTesting() {
  const [phase, setPhase] = useState("joining");

  const [name, setName] = useState("");

  // just for testing this eventually must be moved to utils function
  // to check local storage and/or use window.crypto.randomUUID() to create UUID

  const [userId] = useState("user_" + Math.floor(Math.random() * 9999));

  const [roomCode, setRoomCode] = useState("");

  const [players, setPlayers] = useState([]);

  const [gameData, setGameData] = useState(null);

  const [characterId] = useState(1); // Hardcoded to 1 for debugging

  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected:", socket.id);
    });

    socket.on("lobbyUpdated", (payload) => {
      console.log("[Lobby Update]:", payload);
      setRoomCode(payload.roomCode);
      setPlayers(payload.players);
      setPhase(payload.roomStatus);
    });

    socket.on("roundStarted", (payload) => {
      console.log("[Round Started]:", payload);
      setGameData(payload);
      setPhase("in-game");
    });

    socket.on("joinError", (err) => alert(err.message));
    socket.on("startError", (err) => alert(err.message));

    return () => {
      socket.off("connect");
      socket.off("lobbyUpdated");
      socket.off("joinError");
      socket.off("startError");
    };
  }, []);

  // useEffect to render the countdown in UI
  useEffect(() => {
    //  guard
    const deadline = gameData?.gameState?.roundDeadline;
    if (!deadline) return;

    // calculate how many seconds are left
    const updateTimer = () => {
      const now = Date.now();
      const msRemaining = deadline - now;
      const secondsRemaining = Math.max(0, Math.floor(msRemaining / 1000));

      setTimeLeft(secondsRemaining);

      if (secondsRemaining <= 0) clearInterval(timerId);
    };

    const timerId = setInterval(updateTimer, 100);

    return () => clearInterval(timerId);
  }, [gameData]);

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("Please enter a name");

    const payload = {
      name: name,
      userId: userId,
      roomCode: null,
      characterId,
    };

    socket.emit("joinRoom", payload);
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!name.trim() || !roomCode.trim())
      return alert("Name and Room Code are required");

    const payload = {
      name: name,
      userId: userId,
      roomCode: roomCode.trim().toUpperCase(),
      characterId,
    };

    socket.emit("joinRoom", payload);
  };

  const handleStartGame = (e) => {
    e.preventDefault();
    socket.emit("startGame");
  };

  return (
    <div
      style={{
        padding: "15px",
        color: "green",
        background: "black",
        minHeight: "100vh",
      }}
    >
      {/* 1. JOINING PHASE */}
      {phase === "joining" && (
        <div>
          <h1>Phase: Joining</h1>
          {/* Create Room function */}
          <form onSubmit={handleCreateRoom}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Display Name"
            />
            <button type="submit">Create New Room</button>
          </form>

          <div style={{ margin: "20px 0" }}>--- OR ---</div>

          {/* Join Room function */}
          <form onSubmit={handleJoinRoom}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Display Name"
            />
            <input
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="Room Code"
            />
            <button type="submit">Join Room</button>
          </form>
        </div>
      )}

      {/* 2. LOBBY PHASE */}
      {phase === "lobby" && (
        <div>
          <h1>Phase: Lobby</h1>
          <p>
            Room code: <strong>{roomCode}</strong>
          </p>
          <h2>Players</h2>
          <ul>
            {players.map((p) => (
              <li key={p.userId}>
                {p.name} {p.userId === userId ? "(You)" : ""}
              </li>
            ))}
          </ul>
          <button onClick={handleStartGame}>Game Start</button>
        </div>
      )}

      {/* 3. GAME PHASE */}
      {phase === "in-game" && gameData && (
        <div>
          <h1>Phase: In-Game</h1>
          <p>
            Monster: {gameData.monster.name} ({gameData.monster.hp}/
            {gameData.monster.maxHp})
          </p>

          <h2>Timer: {timeLeft}s</h2>
          <p>Question: {gameData.question.prompt}</p>
          {Object.entries(gameData.question.options).map(([key, text]) => (
            <button
              key={key}
              onClick={() => socket.emit("submitAnswer", { answer: key })}
            >
              {key}: {text}
            </button>
          ))}
        </div>
      )}

      <hr />
      <div>
        <h3>Debugging</h3>
        <pre>
          {JSON.stringify(
            { userId, phase, roomCode, players, gameData },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
}
