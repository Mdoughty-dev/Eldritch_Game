import { io } from "socket.io-client";

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(import.meta.env.VITE_SERVER_URL || "http://localhost:3000", {
      transports: ["websocket"],
    });
    socket.on("connect", () => {
      const userId = localStorage.getItem("eldritchUserId");
      const roomCode = localStorage.getItem("eldritchRoomCode");
      const character = localStorage.getItem("eldritchCharacter");
      const name = localStorage.getItem("eldritchName");

      if (userId && roomCode) {
        socket.emit("joinRoom", {
          roomCode: roomCode,
          userId: userId,
          name: name,
          characterId: character,
        });
      }
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
