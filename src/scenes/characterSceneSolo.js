import Phaser from "phaser";
import backgroundImage from "../assets/background.png";

const characters = import.meta.glob("../assets/character[0-9]*.png", {
  eager: true,
});

console.log(characters);

const charArray = Object.keys(characters).map((path) =>
  path.split("/").pop().replace(".png", ""),
);

console.log(charArray);

const bioArray = [
  "My name is merlin \n I am wizard",
  "I am a mage",
  "I am a warrior",
  "I am dead",
];

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

    for (const path in characters) {
      const key = path.split("/").pop().replace(".png", "");
      console.log(key);
      console.log(characters[path].default);
      this.load.image(key, characters[path].default);
    }
  }
  create() {
    const bg = this.add.image(0, 0, "bg").setOrigin(0);
    const scaleX = this.scale.width / bg.width;
    const scaleY = this.scale.height / bg.height;
    bg.setScale(Math.max(scaleX, scaleY));

    const title = this.add
      .text(this.scale.width / 2, 175, "Choose your Character", {
        fontSize: "72px",
        color: "#d8d8ff",
      })
      .setOrigin(0.5);
    let bioText = this.add
      .text(950, 325, `BIO:\n ${bioArray[0]}`, {
        fontSize: "32px",
        color: "#d8d8ff",
      })
      .setOrigin(0.5);
    const buttonColor = "rgba(187, 12, 240, 0.68)";
    const disabledButton = "rgba(187,12,240,0.3)";
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
        color: disabledButton,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    const submitButton = this.add
      .text(this.scale.width / 2, 675, "Select Character", {
        fontSize: "54px",
        color: "rgb(139, 132, 132)",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    let counter = 0;
    let currentCharacter = this.loadCharacter(charArray[counter]);
    nextButton.on("pointerdown", () => {
      console.log("pointer down pressed");
      if (counter >= charArray.length - 1) {
        nextButton.setColor(disabledButton);
        return;
      }
      if (currentCharacter) currentCharacter.destroy();
      counter += 1;
      bioText.setText(`BIO:\n ${bioArray[counter]}`);
      prevButton.setColor(buttonColor);
      currentCharacter = this.loadCharacter(charArray[counter]);
    });
    prevButton.on("pointerdown", () => {
      console.log("pointer down pressed");
      if (counter <= 0) {
        prevButton.setColor(disabledButton);

        return;
      }
      if (counter > 0) {
        prevButton.setColor(buttonColor);
      }
      if (currentCharacter) currentCharacter.destroy();
      counter -= 1;
      nextButton.setColor(buttonColor);
      bioText.setText(`BIO:\n ${bioArray[counter]}`);
      currentCharacter = this.loadCharacter(charArray[counter]);
    });
    submitButton.on("pointerdown", () => {
      console.log(counter);
    });
  }
}
