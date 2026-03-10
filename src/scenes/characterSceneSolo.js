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
  "Name: Denis McCload\nAge:42\nRace: Human\nBackstory: I lost everything\nMy family, my home, my hope.\nI won't lose my will to fight",
  "Name: Greystaff\nAge:72\nRace: Wizard\nBackstory: Feel my power\nI am the great wizzard\nI'm not delusional",
  "Name: Patris Deathstare\nAge:32\nRace: Human\nBackstory: It is done.\nI crew up in the cult\nthat made this.\nNow I must end it all",
"Name: Unknown \nAge:Unknown\nRace: Dead\nBackstory: Kill\n....Kill\....Kill\nKILL THEM ALL!",
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
  .text(this.scale.width / 2, 125, "Choose your Character", {
    fontSize: "72px",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontStyle: "bold",
    color: "#d8d8ff",
    stroke: "#120c1c",
    strokeThickness: 6,
  })
  .setOrigin(0.5);

title.setShadow(4, 4, "#000000", 8, true, true);
    let bioText = this.add
      .text(1000, 450, `BIO:\n${bioArray[0]}`, {
        fontSize: "24px",
        color: "#e8e8fc",
      })
      .setOrigin(0.5);
    const buttonColor = "rgba(233, 190, 247, 0.98)";
    const disabledButton = "rgba(139, 97, 151, 0.3)";
    const nextButton = this.add
      .text(this.scale.width / 2 + 340, 600, "Next", {
        fontSize: "54px",
        color: buttonColor,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    const prevButton = this.add
      .text(this.scale.width / 2 - 340, 600, "Previous", {
        fontSize: "54px",
        color: disabledButton,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    const submitButton = this.add
      .text(this.scale.width / 2, 675, "Select Character", {
        
        fontSize: "54px",
        color: "rgb(243, 170, 170)",
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
      bioText.setText(`BIO:\n${bioArray[counter]}`);
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
      bioText.setText(`BIO:\n${bioArray[counter]}`);
      currentCharacter = this.loadCharacter(charArray[counter]);
    });
    submitButton.on("pointerdown", () => {
      console.log(counter);
    });
  }
}
