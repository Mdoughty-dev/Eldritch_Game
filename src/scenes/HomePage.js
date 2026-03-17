import Phaser from "phaser";
import background from "../assets/background.png";
import backgroundmp3 from "../assets/background.mp3";
import createMuteToggle from "../game/ui/BackgroundMusicToggle";
import buttonBg from "../assets/buttonNormal.png";

import mute from "../assets/mute.png";
import { loginUser } from "../game/net/groupApi";

// character images
import denisImg from "../assets/Denis.png";
import greyStaffImg from "../assets/Greystaff.png";
import patrisImg from "../assets/Patris.png";
import unknownImg from "../assets/Unknown.png";

// monster images
import sewerBeastImg from "../assets/sewer_rat.png";
import paleSlugImg from "../assets/pale_slug.png";
import eldritchAbominationImg from "../assets/eldritch_abomination.png";

export default class HomePage extends Phaser.Scene {
  constructor() {
    super("HomePage");
  }

  preload() {
    // homepage assets
    this.load.image("background", background);
    this.load.audio("backgroundmp3", backgroundmp3);
    this.load.image("mute", mute);
    this.load.image("buttonBg", buttonBg);

    // character assets
    // keys must match your character.image_name values
    this.load.image("Denis", denisImg);
    this.load.image("GreyStaff", greyStaffImg);
    this.load.image("Patris", patrisImg);
    this.load.image("Unknown", unknownImg);

    // monster assets
    // keys must match your monster.image_name values
    this.load.image("sewer_rat", sewerBeastImg);
    this.load.image("pale_slug", paleSlugImg);
    this.load.image("eldritch_abomination", eldritchAbominationImg);
  }

  create() {
    this.createBackground();
    this.createSoloButton();
    this.createTeamButton();
    this.createLoginButton();
    createMuteToggle(this, "backgroundmp3");

    this.add
      .text(this.scale.width / 2, 100, "Forbidden Knowledge", {
        fontSize: "64px",
        fontFamily: "Blackletter",
        color: "#FFFFFF",
      })
      .setOrigin(0.5);

    this.welcomeText = this.add
      .text(100, 50, `Welcome: Guest`, {
        fontSize: "16px",
        fontFamily: "Blackletter",
        color: "#FFFFFF",
      })
      .setOrigin(0.5);
  }

  createBackground() {
    const bg = this.add.image(0, 0, "background").setOrigin(0);
    const scaleX = this.scale.width / bg.width;
    const scaleY = this.scale.height / bg.height;
    bg.setScale(Math.max(scaleX, scaleY));
  }

  createLoginButton() {
    const buttonBg = this.add
      .image(this.scale.width / 2, 300, "buttonBg")
      .setOrigin(0.5);
    buttonBg.setScale(0.5).setDepth(1);

    const loginButton = this.add
      .text(this.scale.width / 2, 300, "Login", {
        fontSize: "32px",
        color: "#FFFFFF",
        fontFamily: "Blackletter",
      })
      .setOrigin(0.5)
      .setDepth(2);

    buttonBg.setInteractive({ useHandCursor: true });
    buttonBg.on("pointerdown", () => {
      console.log("solo button is pressed");
      // this.scene.start("characterSceneSolo");
      this.sound.stopAll();
      this.openLoginPrompt();
    });
  }

  createSoloButton() {
    const buttonBg = this.add
      .image(this.scale.width / 2, 400, "buttonBg")
      .setOrigin(0.5);
    buttonBg.setScale(0.5).setDepth(1);

    const soloButton = this.add
      .text(this.scale.width / 2, 400, "Adventure Alone", {
        fontSize: "32px",
        color: "#FFFFFF",
        fontFamily: "Blackletter",
      })
      .setOrigin(0.5)
      .setDepth(2);

    buttonBg.setInteractive({ useHandCursor: true });
    buttonBg.on("pointerdown", () => {
      console.log("solo button is pressed");
      this.scene.start("characterSceneSolo");
      this.sound.stopAll();
    });
  }

  createTeamButton() {
    const buttonBgTeam = this.add
      .image(this.scale.width / 2, 500, "buttonBg")
      .setOrigin(0.5);
    buttonBgTeam.setScale(0.5).setDepth(1);

    const teamButton = this.add
      .text(this.scale.width / 2, 500, "Adventure Together", {
        fontSize: "32px",
        color: "#FFFFFF",
        fontFamily: "Blackletter",
      })
      .setOrigin(0.5)
      .setDepth(2);

    buttonBgTeam.setInteractive({ useHandCursor: true });
    buttonBgTeam.on("pointerdown", () => {
      console.log("group button is pressed");
      this.scene.start("GroupLobbyScene");
    });
  }

  openLoginPrompt() {
    this.openTextPrompt({
      title: "Enter Name",
      initialValue: this.playerName || "",
      placeholder: "Type here...",
      maxLength: 16,
      forceUppercase: false,
      onSave: (value) => {
        this.updatePlayerName(value);
        this.characterConfirmed = true;
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

    const loginButton = this.add
      .rectangle(width / 2 - 80, height / 2 + 78, 120, 45, 0x2d6a4f, 0.9)
      .setStrokeStyle(1, 0xffffff, 0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(101);

    const loginText = this.add
      .text(width / 2 - 80, height / 2 + 78, "Login", {
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
      loginButton,
      loginText,
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

    loginButton.on("pointerdown", () => {
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

  updatePlayerName(name) {
    this.playerName = name.trim();
    this.welcomeText.setText(`Welcome: ${this.playerName || "Guest"}`);
  }
}
