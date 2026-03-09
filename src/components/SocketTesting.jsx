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

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected:", socket.id);
    });

    socket.on("lobbyUpdated", (payload) => {
      setRoomCode(payload.roomCode);
      setPlayers(payload.players);
      setPhase(payload.roomStatus);
    });

    socket.on("joinError", (err) => alert(err.message));

    return () => {
      socket.off("connect");
      socket.off("lobbyUpdated");
      socket.off("joinError");
    };
  }, []);

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("Please enter a name");

    const payload = {
      name: name,
      userId: userId,
      roomCode: null,
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
    };

    socket.emit("joinRoom", payload);
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
          <button onClick={() => setPhase("in-game")}>Game Start</button>
        </div>
      )}

      {/* 3. GAME PHASE */}
      {phase === "in-game" && (
        <div>
          <h1>Phase: In-Game</h1>
        </div>
      )}
    </div>
  );
}
