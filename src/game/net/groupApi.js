import { getSocket } from "./socketClient";

export function joinRoom(payload) {
  getSocket().emit("joinRoom", payload);
}

export function startGame() {
  getSocket().emit("startGame");
}

export function submitAnswer(payload) {
  getSocket().emit("submitAnswer", payload);
}

export function onLobbyUpdated(handler) {
  getSocket().on("lobbyUpdated", handler);
}

export function onJoinError(handler) {
  getSocket().on("joinError", handler);
}

export function onStartError(handler) {
  getSocket().on("startError", handler);
}

export function onAnswerError(handler) {
  getSocket().on("answerError", handler);
}

export function onRoundStarted(handler) {
  getSocket().on("roundStarted", handler);
}

export function onRoundResult(handler) {
  getSocket().on("roundResult", handler);
}

export function onGameEnded(handler) {
  getSocket().on("gameEnded", handler);
}

export function offLobbyUpdated(handler) {
  getSocket().off("lobbyUpdated", handler);
}

export function offJoinError(handler) {
  getSocket().off("joinError", handler);
}

export function offStartError(handler) {
  getSocket().off("startError", handler);
}

export function offAnswerError(handler) {
  getSocket().off("answerError", handler);
}

export function offRoundStarted(handler) {
  getSocket().off("roundStarted", handler);
}

export function offRoundResult(handler) {
  getSocket().off("roundResult", handler);
}

export function offGameEnded(handler) {
  getSocket().off("gameEnded", handler);
}
export function leaveRoom(payload) {
  getSocket().emit("leaveRoom", payload);
}

export function loginUser(loginData) {
  getSocket().emit("login", loginData);
}
