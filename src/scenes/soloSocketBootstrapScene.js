import Phaser from "phaser";
import { characters } from "../game/data/characterData";
import * as groupApi from "../game/net/groupApi";

const {
  joinRoom,
  startGame,
  requestLobby,
  onLobbyUpdated,
  onJoinError,
  onStartError,
  onRoundStarted,
  offLobbyUpdated,
  offJoinError,
  offStartError,
  offRoundStarted,
} = groupApi;

export default class SoloSocketBootstrapScene extends Phaser.Scene {
  constructor() {
    super("SoloSocketBootstrapScene");
  }

  init(data) {
    this.selectedIndex = data?.selectedIndex ?? 0;
    this.playerName = data?.playerName ?? "";
    this.roomCode = null;
    this.hasStartedGame = false;
    this.hasResolvedLobbyCheck = false;
    this.fallbackCreateEvent = null;
    this.isRecreatingRoom = false;
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
      .text(this.scale.width / 2, 600, "Checking existing room...", {
        fontSize: "28px",
        color: "#d8d8ff",
      })
      .setOrigin(0.5);

    this.handleLobbyUpdated = (payload) => {
      const myUserId = localStorage.getItem("eldritchUserId");
      const me = payload.players?.find((player) => player.userId === myUserId);

      if (!me) return;

      if (this.fallbackCreateEvent) {
        this.fallbackCreateEvent.remove(false);
        this.fallbackCreateEvent = null;
      }

      this.hasResolvedLobbyCheck = true;
      this.roomCode = payload.roomCode;

      localStorage.setItem("eldritchRoomCode", payload.roomCode);

      const matchedIndex = characters.findIndex(
        (c) =>
          (c.character_id ?? c.id) ===
          (me.character?.character_id ?? me.character?.id)
      );

      if (matchedIndex !== -1) {
        this.selectedIndex = matchedIndex;
        const character = characters[this.selectedIndex];
        localStorage.setItem(
          "eldritchCharacter",
          character.character_id ?? character.id
        );
      }
      localStorage.setItem("eldritchName", me.name);

      if (!this.isRecreatingRoom) {
        this.isRecreatingRoom = true;
        this.statusText.setText(`Leaving old room ${this.roomCode}...`);

        groupApi.leaveRoom();

        this.time.delayedCall(150, () => {
          this.statusText.setText("Creating fresh private room...");
          this.createSoloSocketRoom();
        });
        return;
      }

      this.statusText.setText(
        `Room created: ${this.roomCode}. Starting game...`
      );

      if (!this.hasStartedGame && payload.roomStatus === "lobby") {
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
      const currentCharacter = characters[this.selectedIndex];

      this.scene.start("EncounterScene", {
        mode: "group",
        roomCode: this.roomCode,
        selectedIndex: this.selectedIndex,
        roundStartedPayload: payload,
        groupPlayers: [
          {
            userId: localStorage.getItem("eldritchUserId"),
            name: localStorage.getItem("eldritchPlayerName") || "Solo Player",
            character: currentCharacter,
          },
        ],
      });
    };

    onLobbyUpdated(this.handleLobbyUpdated);
    onJoinError(this.handleJoinError);
    onStartError(this.handleStartError);
    onRoundStarted(this.handleRoundStarted);

    this.checkExistingLobbyOrCreateRoom();

    this.events.once("shutdown", () => {
      this.shutdown();
    });
  }

  checkExistingLobbyOrCreateRoom() {
    let userId = localStorage.getItem("eldritchUserId");
    if (!userId) {
      userId = crypto.randomUUID();
      localStorage.setItem("eldritchUserId", userId);
    }

    let playerName =
      this.playerName || localStorage.getItem("eldritchPlayerName");
    if (!playerName) {
      playerName = "Solo Player";
    }

    localStorage.setItem("eldritchPlayerName", playerName);

    requestLobby();

    this.fallbackCreateEvent = this.time.delayedCall(700, () => {
      if (this.hasResolvedLobbyCheck) return;

      this.statusText.setText("Creating private room...");
      this.isRecreatingRoom = true;
      this.createSoloSocketRoom();
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

    let playerName =
      this.playerName || localStorage.getItem("eldritchPlayerName");
    if (!playerName) {
      playerName = "Solo Player";
      localStorage.setItem("eldritchPlayerName", playerName);
    }
    localStorage.setItem("eldritchCharacter", characterId);

    joinRoom({
      name: playerName,
      roomCode: "",
      userId,
      characterId,
    });
  }

  shutdown() {
    if (this.fallbackCreateEvent) {
      this.fallbackCreateEvent.remove(false);
      this.fallbackCreateEvent = null;
    }

    if (this.handleLobbyUpdated) offLobbyUpdated(this.handleLobbyUpdated);
    if (this.handleJoinError) offJoinError(this.handleJoinError);
    if (this.handleStartError) offStartError(this.handleStartError);
    if (this.handleRoundStarted) offRoundStarted(this.handleRoundStarted);
  }

  destroy() {
    this.shutdown();
  }
}
