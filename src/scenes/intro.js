import Phaser from "phaser";
import logo from "../assets/logo.png";
import title from "../assets/title2.png";

// added here to preload to handle disconnection
import background from "../assets/background.png";
import backgroundmp3 from "../assets/background.mp3";
import buttonBg from "../assets/buttonNormal.png";
import buttonHighlight from "../assets/buttonhighlight.png";
import mute from "../assets/mute.png";
import denisImg from "../assets/Denis.png";
import greyStaffImg from "../assets/Greystaff.png";
import patrisImg from "../assets/Patris.png";
import unknownImg from "../assets/Unknown.png";
import sewerBeastImg from "../assets/sewer_rat.png";
import paleSlugImg from "../assets/pale_slug.png";
import eldritchAbominationImg from "../assets/eldritch_abomination.png";

export default class IntroScene extends Phaser.Scene {
  constructor() {
    super("IntroScene");
  }

  preload() {
    this.load.image("logo", logo);
    this.load.image("title", title);

    // added here to preload to handle disconnection
    this.load.image("background", background);
    this.load.audio("backgroundmp3", backgroundmp3);
    this.load.image("mute", mute);
    this.load.image("buttonBg", buttonBg);
    this.load.image("buttonHighlight", buttonHighlight);

    this.load.image("Denis", denisImg);
    this.load.image("GreyStaff", greyStaffImg);
    this.load.image("Patris", patrisImg);
    this.load.image("Unknown", unknownImg);

    this.load.image("sewer_rat", sewerBeastImg);
    this.load.image("pale_slug", paleSlugImg);
    this.load.image("eldritch_abomination", eldritchAbominationImg);
  }

  create() {
    const activeRoom = localStorage.getItem("eldritchRoomCode");
    const activeUser = localStorage.getItem("eldritchUserId");

    if (activeRoom && activeUser) {
      this.scene.start("GroupLobbyScene");
      return;
    }

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    const studiologo = this.add
      .image(this.scale.width / 2, 250, "logo")
      .setOrigin(0.5)
      .setAlpha(0);

    const presentsText = this.add
      .text(centerX, centerY + 80, "presents", {
        fontSize: "24px",
        fontFamily: "Blackletter",
        color: "#696969",
        fontStyle: "italic",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    const titleText = this.add
      .image(centerX, centerY + 320, "title")
      .setOrigin(0.5)
      .setAlpha(0)
      .setScale(0.35);

    this.tweens.add({
      targets: [studiologo, presentsText],
      alpha: 1,
      duration: 2000,
      onComplete: () => {
        this.tweens.add({
          targets: titleText,
          alpha: 1,
          duration: 2500,
          onComplete: () => {
            this.cameras.main.fadeOut(1500, 0, 0, 0);
            this.cameras.main.once(
              Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
              () => {
                this.scene.start("HomePage");
              }
            );
          },
        });
      },
    });
  }
}
