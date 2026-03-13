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

export default class GroupLobbyScene extends Phaser.Scene {
  constructor() {
    super("GroupLobbyScene");
  }

  init(data) {
    this.playerName = data?.playerName ?? "";
    this.roomCode = data?.roomCode ?? "";
    this.selectedIndex = data?.selectedIndex ?? 0;

    this.lobbyState = null;
    this.currentCharacterImage = null;
  }

  create() {
    const bg = this.add.image(0, 0, "background").setOrigin(0);
    const scaleX = this.scale.width / bg.width;
    const scaleY = this.scale.height / bg.height;
    bg.setScale(Math.max(scaleX, scaleY));

    this.add
      .text(this.scale.width / 2, 80, "Group Lobby", {
        fontSize: "64px",
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontStyle: "bold",
        color: "#d8d8ff",
        stroke: "#120c1c",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.nameText = this.add.text(
      120,
      170,
      `Name: ${this.playerName || "Not set"}`,
      {
        fontSize: "28px",
        color: "#ffffff",
      }
    );

    this.roomCodeText = this.add.text(
      120,
      210,
      `Room Code: ${this.roomCode || "None"}`,
      {
        fontSize: "28px",
        color: "#ffffff",
      }
    );

    this.characterNameText = this.add.text(120, 250, "", {
      fontSize: "28px",
      color: "#ffffff",
    });

    this.bioText = this.add
      .text(950, 370, "", {
        fontSize: "22px",
        color: "#e8e8fc",
        wordWrap: { width: 380 },
      })
      .setOrigin(0.5);

    this.statusText = this.add
      .text(this.scale.width / 2, 680, "", {
        fontSize: "24px",
        color: "#ffb3b3",
      })
      .setOrigin(0.5);

    this.playersTitle = this.add.text(120, 320, "Players in room:", {
      fontSize: "30px",
      color: "#d8d8ff",
    });

    this.playersText = this.add.text(120, 360, "No room joined yet", {
      fontSize: "24px",
      color: "#ffffff",
      lineSpacing: 8,
    });

    this.createButtons();
    this.updateCharacterView();

    this.handleLobbyUpdated = (payload) => {
      this.lobbyState = payload;
      this.roomCode = payload.roomCode;
      this.roomCodeText.setText(`Room Code: ${this.roomCode}`);

      const playerLines = payload.players.map((player, index) => {
        const hostLabel = player.userId === payload.hostUserId ? " (Host)" : "";
        return `${index + 1}. ${player.name}${hostLabel} - ${player.character.name}`;
      });

      this.playersText.setText(playerLines.join("\n"));
      this.statusText.setText("Joined lobby");
      this.startButton.setVisible(true);
    };

    this.handleJoinError = (payload) => {
      this.statusText.setText(payload.message || "Failed to join room");
    };

    this.handleStartError = (payload) => {
      this.statusText.setText(payload.message || "Could not start game");
    };

    this.handleRoundStarted = (payload) => {
      const currentCharacter = characters[this.selectedIndex];

      this.scene.start("EncounterScene", {
        mode: "group",
        roomCode: this.roomCode,
        selectedIndex: this.selectedIndex,
        roundStartedPayload: payload,
        groupCharacter: currentCharacter,
      });
    };

    this.events.once("shutdown", () => {
      this.shutdown();
    });

    onLobbyUpdated(this.handleLobbyUpdated);
    onJoinError(this.handleJoinError);
    onStartError(this.handleStartError);
    onRoundStarted(this.handleRoundStarted);
  }

  createButtons() {
    const buttonStyle = {
      fontSize: "30px",
      color: "#ffffff",
      backgroundColor: "#4949494f",
      padding: { left: 10, right: 10, top: 6, bottom: 6 },
    };

    this.setNameButton = this.add
      .text(120, 540, "Set Name", buttonStyle)
      .setInteractive({ useHandCursor: true });

    this.prevCharacterButton = this.add
      .text(120, 590, "Previous Character", buttonStyle)
      .setInteractive({ useHandCursor: true });

    this.nextCharacterButton = this.add
      .text(950, 590, "Next Character", buttonStyle)
      .setInteractive({ useHandCursor: true });

    this.createRoomButton = this.add
      .text(120, 650, "Create Room", buttonStyle)
      .setInteractive({ useHandCursor: true });

    this.joinRoomButton = this.add
      .text(360, 650, "Join Room", buttonStyle)
      .setInteractive({ useHandCursor: true });

    this.startButton = this.add
      .text(560, 650, "Start Game", buttonStyle)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);

    this.setNameButton.on("pointerdown", () => {
      this.openNamePrompt();
    });

    this.prevCharacterButton.on("pointerdown", () => {
      if (this.selectedIndex <= 0) return;
      this.selectedIndex -= 1;
      this.updateCharacterView();
    });

    this.nextCharacterButton.on("pointerdown", () => {
      if (this.selectedIndex >= characters.length - 1) return;
      this.selectedIndex += 1;
      this.updateCharacterView();
    });

    this.createRoomButton.on("pointerdown", () => {
      this.tryJoinOrCreateRoom("");
    });

    this.joinRoomButton.on("pointerdown", () => {
      this.openRoomCodePrompt();
    });

    this.startButton.on("pointerdown", () => {
      startGame();
      this.statusText.setText("Starting game...");
    });
  }

  updatePlayerName(name) {
    this.playerName = name.trim();
    this.nameText.setText(`Name: ${this.playerName || "Not set"}`);
  }

  updateRoomCode(code) {
    this.roomCode = code.trim().toUpperCase();
    this.roomCodeText.setText(`Room Code: ${this.roomCode || "None"}`);
  }

  openNamePrompt() {
    this.openTextPrompt({
      title: "Enter Name",
      initialValue: this.playerName || "",
      placeholder: "Type here...",
      maxLength: 16,
      forceUppercase: false,
      onSave: (value) => {
        this.updatePlayerName(value);
      },
    });
  }

  openRoomCodePrompt() {
    this.openTextPrompt({
      title: "Enter Room Code",
      initialValue: this.roomCode || "",
      placeholder: "ABCD",
      maxLength: 8,
      forceUppercase: true,
      onSave: (value) => {
        const code = value.trim().toUpperCase();
        this.updateRoomCode(code);
        this.tryJoinOrCreateRoom(code);
      },
    });
  }

  openTextPrompt({
    title = "Enter Text",
    initialValue = "",
    placeholder = "Type here...",
    maxLength = 16,
    forceUppercase = false,
    onSave,
  }) {
    const { width, height } = this.scale;

    const overlay = this.add
      .rectangle(0, 0, width, height, 0x000000, 0.55)
      .setOrigin(0)
      .setDepth(100)
      .setInteractive();

    const panel = this.add
      .rectangle(width / 2, height / 2, 500, 240, 0x111111, 0.78)
      .setStrokeStyle(2, 0xd8d8ff, 0.8)
      .setDepth(101);

    const titleText = this.add
      .text(width / 2, height / 2 - 78, title, {
        fontSize: "32px",
        color: "#d8d8ff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(102);

    const inputHtml = `
      <input
        type="text"
        id="modal-input"
        value="${this.escapeHtml(initialValue)}"
        placeholder="${this.escapeHtml(placeholder)}"
        maxlength="${maxLength}"
        autocapitalize="${forceUppercase ? "characters" : "words"}"
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
        style="
          width: 320px;
          height: 44px;
          padding: 0 14px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.45);
          outline: none;
          background: rgba(34,34,51,0.88);
          color: white;
          font-size: 24px;
          font-family: Georgia, 'Times New Roman', serif;
          box-sizing: border-box;
          text-align: left;
        "
      />
    `;

    const inputDom = this.add
      .dom(width / 2, height / 2 - 8)
      .createFromHTML(inputHtml)
      .setDepth(103);

    const inputEl = inputDom.node.querySelector("#modal-input");

    const saveButton = this.add
      .rectangle(width / 2 - 80, height / 2 + 78, 120, 45, 0x2d6a4f, 0.9)
      .setStrokeStyle(1, 0xffffff, 0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(101);

    const saveText = this.add
      .text(width / 2 - 80, height / 2 + 78, "Save", {
        fontSize: "22px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setDepth(102);

    const cancelButton = this.add
      .rectangle(width / 2 + 80, height / 2 + 78, 120, 45, 0x7f1d1d, 0.9)
      .setStrokeStyle(1, 0xffffff, 0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(101);

    const cancelText = this.add
      .text(width / 2 + 80, height / 2 + 78, "Cancel", {
        fontSize: "22px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setDepth(102);

    const modalItems = [
      overlay,
      panel,
      titleText,
      inputDom,
      saveButton,
      saveText,
      cancelButton,
      cancelText,
    ];

    const closeModal = () => {
      modalItems.forEach((item) => item.destroy());
    };

    const handleSubmit = () => {
      let value = inputEl.value ?? "";

      if (forceUppercase) {
        value = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
      }

      value = value.trim();

      if (!value) return;

      onSave(value);
      closeModal();
    };

    inputEl.addEventListener("input", () => {
      if (forceUppercase) {
        inputEl.value = inputEl.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
      }
    });

    inputEl.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        handleSubmit();
      }

      if (event.key === "Escape") {
        closeModal();
      }
    });

    saveButton.on("pointerdown", () => {
      handleSubmit();
    });

    cancelButton.on("pointerdown", () => {
      closeModal();
    });

    this.time.delayedCall(50, () => {
      inputEl.focus();
      inputEl.select();
    });
  }

  escapeHtml(value = "") {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  updateCharacterView() {
    const currentCharacter = characters[this.selectedIndex];

    this.characterNameText.setText(`Character: ${currentCharacter.name}`);
    this.bioText.setText(currentCharacter.bio);

    if (this.currentCharacterImage) {
      this.currentCharacterImage.destroy();
    }

    this.currentCharacterImage = this.add
      .image(this.scale.width / 2, 360, currentCharacter.image_name)
      .setOrigin(0.5)
      .setScale(0.35);
  }

  tryJoinOrCreateRoom(roomCode) {
    if (!this.playerName) {
      this.statusText.setText("Set your name first");
      return;
    }

    const currentCharacter = characters[this.selectedIndex];
    const characterId = currentCharacter.character_id ?? currentCharacter.id;

    if (!characterId) {
      this.statusText.setText("Character is missing backend character_id");
      return;
    }

    let userId = localStorage.getItem("eldritchUserId");
    if (!userId) {
      userId = crypto.randomUUID();
      localStorage.setItem("eldritchUserId", userId);
    }

    joinRoom({
      name: this.playerName,
      roomCode,
      userId,
      characterId,
    });

    this.statusText.setText(roomCode ? "Joining room..." : "Creating room...");
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