import Phaser from "phaser";
import background from "../assets/background.png";
import backgroundmp3 from "../assets/background.mp3";
import createMuteToggle from "../game/ui/BackgroundMusicToggle";
import mute from "../assets/mute.png";

export default class HomePage extends Phaser.Scene {
  constructor() {
    super("HomePage");
  }

  preload() {
    this.load.image("background", background);
    this.load.audio("backgroundmp3", backgroundmp3);
    this.load.image("mute", mute);
  }

  create() {
    this.createBackground();
    this.createSoloButton();
    this.createTeamButton();
    createMuteToggle(this, "backgroundmp3");

    this.add
      .text(this.scale.width / 2, 100, "Forbidden Knowledge", {
        fontSize: "64px",
        fontFamily: "Blackletter",
        color: "#FFFFFF",
      })
      .setOrigin(0.5);
  }

  createBackground() {
    const background = this.add.image(0, 0, "background").setOrigin(0);
    const scaleX = this.scale.width / background.width;
    const scaleY = this.scale.height / background.height;
    background.setScale(Math.max(scaleX, scaleY));
  }

  createSoloButton() {
    const soloButton = this.add
      .text(this.scale.width / 2, 400, "Adventure Alone", {
        fontSize: "32px",
        color: "#FFFFFF",
        backgroundColor: "#494949",
        fontFamily: "Blackletter",
      })
      .setOrigin(0.5);

    soloButton.setInteractive({ useHandCursor: true });
    soloButton.on("pointerdown", () => {
      console.log("solo button is pressed");
      this.scene.start("characterSceneSolo")
    });
  }

  createTeamButton() {
    const teamButton = this.add
      .text(this.scale.width / 2, 500, "Adventure Together", {
        fontSize: "32px",
        color: "#FFFFFF",
        backgroundColor: "#494949",
        fontFamily: "Blackletter",
      })
      .setOrigin(0.5);

    teamButton.setInteractive({ useHandCursor: true });
    teamButton.on("pointerdown", () => {
      console.log(" team button is pressed");
    });
  }
}
