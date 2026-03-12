import Phaser from "phaser";
import { characters } from "../game/data/characterData";
import {
  joinRoom,
  startGame,
  onLobbyUpdated,
  onJoinError,
  onStartError,
  onRoundStarted,
  offLobbyUpdated,
  offJoinError,
  offStartError,
  offRoundStarted,
} from "../game/net/groupApi";

export default class SoloSocketBootstrapScene extends Phaser.Scene {
  constructor() {
    super("SoloSocketBootstrapScene");
  }

  init(data) {
    this.selectedIndex = data?.selectedIndex ?? 0;
    this.roomCode = null;
    this.hasStartedGame = false;
  }

  create() {
    const bg = this.add.image(0, 0, "background").setOrigin(0);
    const scaleX = this.scale.width / bg.width;
    const scaleY = this.scale.height / bg.height;
    bg.setScale(Math.max(scaleX, scaleY));

    const character = characters[this.selectedIndex];

    this.add
      .text(this.scale.width / 2, 140, "Preparing Solo Adventure...", {
        fontSize: "56px",
        color: "#ffffff",
        fontFamily: "Blackletter",
      })
      .setOrigin(0.5);

    this.add
      .image(this.scale.width / 2, 340, character.image_name)
      .setOrigin(0.5)
      .setScale(0.35);

    this.statusText = this.add
      .text(this.scale.width / 2, 600, "Creating private room...", {
        fontSize: "28px",
        color: "#d8d8ff",
      })
      .setOrigin(0.5);

    this.handleLobbyUpdated = (payload) => {
      this.roomCode = payload.roomCode;
      this.statusText.setText(`Room created: ${this.roomCode}. Starting game...`);

      if (!this.hasStartedGame) {
        this.hasStartedGame = true;
        startGame();
      }
    };

    this.handleJoinError = (payload) => {
      this.statusText.setText(payload.message || "Failed to create solo room");
    };

    this.handleStartError = (payload) => {
      this.statusText.setText(payload.message || "Failed to start solo game");
    };

    this.handleRoundStarted = (payload) => {
      this.scene.start("EncounterScene", {
        mode: "group",
        roomCode: this.roomCode,
        selectedIndex: this.selectedIndex,
        roundStartedPayload: payload,
        groupCharacter: character,
        groupPlayers: [
          {
            userId: localStorage.getItem("eldritchUserId"),
            name: localStorage.getItem("eldritchPlayerName") || "Solo Player",
            character,
          },
        ],
      });
    };

    onLobbyUpdated(this.handleLobbyUpdated);
    onJoinError(this.handleJoinError);
    onStartError(this.handleStartError);
    onRoundStarted(this.handleRoundStarted);

    this.createSoloSocketRoom();
    this.events.once("shutdown", () => {
  this.shutdown();
});
  }

  createSoloSocketRoom() {
    const character = characters[this.selectedIndex];
    const characterId = character.character_id ?? character.id;

    let userId = localStorage.getItem("eldritchUserId");
    if (!userId) {
      userId = crypto.randomUUID();
      localStorage.setItem("eldritchUserId", userId);
    }

    let playerName = localStorage.getItem("eldritchPlayerName");
    if (!playerName) {
      playerName = "Solo Player";
      localStorage.setItem("eldritchPlayerName", playerName);
    }

    joinRoom({
      name: playerName,
      roomCode: "",
      userId,
      characterId,
    });
  }

  shutdown() {
    if (this.handleLobbyUpdated) offLobbyUpdated(this.handleLobbyUpdated);
    if (this.handleJoinError) offJoinError(this.handleJoinError);
    if (this.handleStartError) offStartError(this.handleStartError);
    if (this.handleRoundStarted) offRoundStarted(this.handleRoundStarted);
  }

  destroy() {
    this.shutdown();
  }
}