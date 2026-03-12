import Phaser from "phaser";
import background from "../assets/background.png";
import backgroundmp3 from "../assets/background.mp3";
import createMuteToggle from "../game/ui/BackgroundMusicToggle";

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
    const bg = this.add.image(0, 0, "background").setOrigin(0);
    const scaleX = this.scale.width / bg.width;
    const scaleY = this.scale.height / bg.height;
    bg.setScale(Math.max(scaleX, scaleY));
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
      this.scene.start("characterSceneSolo");
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
    teamButton.on("pointerdown", () =>{
        console.log("group button is pressed");
      this.scene.start("GroupLobbyScene");
      })
    
  }
}