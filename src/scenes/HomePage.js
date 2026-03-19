import Phaser from "phaser";
import background from "../assets/background.png";
import backgroundmp3 from "../assets/background.mp3";
import createMuteToggle from "../game/ui/BackgroundMusicToggle";
import buttonBg from "../assets/buttonNormal.png";
import buttonHighlight from "../assets/buttonhighlight.png";
import backgroundnew from "../assets/bg.png";

import mute from "../assets/mute.png";

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
    this.load.image("buttonHighlight", buttonHighlight);
    this.load.image("backgroundnew", backgroundnew);

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
    this.createLeaderboardButton();
    createMuteToggle(this, "backgroundmp3");
  }

  createBackground() {
    const bg = this.add.image(0, 0, "background").setOrigin(0);
    createMuteToggle(this, "backgroundmp3");
  }

  createBackground() {
    const bg = this.add.image(0, 0, "backgroundnew").setOrigin(0);
    const scaleX = this.scale.width / bg.width;
    const scaleY = this.scale.height / bg.height;
    bg.setScale(Math.max(scaleX, scaleY));
  }

  createSoloButton() {
    const buttonBg = this.add
      .image(this.scale.width / 2, 400, "buttonBg")
      .setOrigin(0.5);
    buttonBg
      .setScale(0.5)
      .setDepth(1)
      .on("pointerover", () => {
        activeSolo.setDepth(2);
      })
      .on("pointerout", () => {
        activeSolo.setDepth(0);
      });

    const activeSolo = this.add
      .image(this.scale.width / 2, 400, "buttonHighlight")
      .setOrigin(0.5)
      .setDepth(0)
      .setScale(0.225, 0.245);

    const soloButton = this.add
      .text(this.scale.width / 2, 400, "Adventure Alone", {
        fontSize: "32px",
        color: "#FFFFFF",
        fontFamily: "Blackletter",
      })
      .setOrigin(0.5)
      .setDepth(3);

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
    buttonBgTeam
      .setScale(0.5)
      .setDepth(1)
      .on("pointerover", () => {
        buttonTeamActive.setDepth(2);
      })
      .on("pointerout", () => {
        buttonTeamActive.setDepth(0);
      });

    const buttonTeamActive = this.add
      .image(this.scale.width / 2, 500, "buttonHighlight")
      .setOrigin(0.5)
      .setDepth(0)
      .setScale(0.225, 0.245);

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
      this.sound.stopAll();
      this.scene.start("GroupLobbyScene");
    });
  }
  createLeaderboardButton() {
    const buttonBgLeaderboard = this.add
      .image(this.scale.width / 2, 600, "buttonBg")
      .setOrigin(0.5);
    buttonBgLeaderboard
      .setScale(0.5)
      .setDepth(1)
      .on("pointerover", () => {
        buttonLeaderboardActive.setDepth(2);
      })
      .on("pointerout", () => {
        buttonLeaderboardActive.setDepth(0);
      });

    const buttonLeaderboardActive = this.add
      .image(this.scale.width / 2, 600, "buttonHighlight")
      .setOrigin(0.5)
      .setDepth(0)
      .setScale(0.225, 0.245);

    const leaderboardButton = this.add
      .text(this.scale.width / 2, 600, "Leaderboard", {
        fontSize: "32px",
        color: "#FFFFFF",
        fontFamily: "Blackletter",
      })
      .setOrigin(0.5)
      .setDepth(2);

    buttonBgLeaderboard.setInteractive({ useHandCursor: true });
    buttonBgLeaderboard.on("pointerdown", () => {
      console.log("leaderboard button is pressed");
      this.sound.stopAll();
      this.scene.start("LeaderboardScene");
    });
  }
}
