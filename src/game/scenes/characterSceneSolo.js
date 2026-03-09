import Phaser from "phaser";
import backgroundImage from "../../assets/background.png";
import character1 from "../../assets/character1.png";
import character2 from "../../assets/character2.png";
import character3 from "../../assets/character3.png";
import character4 from "../../assets/character4.png"
const charArray = ["char1", "char2", "char3", "char4"];

export default class characterSceneSolo extends Phaser.Scene {
  constructor() {
    super("characterSceneSolo");
  }

  loadCharacter(character) {
    character = this.add
      .image(this.scale.width / 2, 450, character)
      .setOrigin(0.5);
    character.setScale(0.4);
	  return character;
  }

  preload() {
    this.load.image("bg", backgroundImage);
    this.load.image("char1", character1);
    this.load.image("char2", character2);
    this.load.image("char3", character3);
    this.load.image("char4", character4)	  
  }

  create() {
    const bg = this.add.image(0, 0, "bg").setOrigin(0);
    const scaleX = this.scale.width / bg.width;
    const scaleY = this.scale.height / bg.height;
    bg.setScale(Math.max(scaleX, scaleY));

    const title = this.add
      .text(this.scale.width / 2, 175, "characterSelectScene", {
        fontSize: "72px",
        color: "#d8d8ff",
      })
      .setOrigin(0.5);

    const buttonColor = "rgba(187, 12, 240, 0.68)";
    const nextButton = this.add
      .text(this.scale.width / 2 + 250, 450, "Next", {
        fontSize: "54px",
        color: buttonColor,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    const prevButton = this.add
      .text(this.scale.width / 2 - 320, 450, "Previous", {
        fontSize: "54px",
        color: buttonColor,
      })
      .setOrigin(0.5);
    let counter = 0;
    let currentCharacter = this.loadCharacter(charArray[counter]);	  
    nextButton.on("pointerdown", () => {
      console.log("pointer down pressed");
      if (currentCharacter)
	    currentCharacter.destroy();
      counter += 1;
      currentCharacter = this.loadCharacter(charArray[counter]);
    });

  
  }
}
