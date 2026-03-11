import Phaser from "phaser";
import backgroundImage from "../assets/background.png";
import backgroundmp3 from "../assets/background.mp3";
import createMuteToggle from "../game/ui/BackgroundMusicToggle";
import mute from "../assets/mute.png";

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

  loadCharacter(imageKey) {
    const character = this.add
      .image(this.scale.width / 2, 450, imageKey)
      .setOrigin(0.5);

    character.setScale(0.4);
    return character;
  }

  create() {
    const bg = this.add.image(0, 0, "background").setOrigin(0);
    const scaleX = this.scale.width / bg.width;
    const scaleY = this.scale.height / bg.height;
    bg.setScale(Math.max(scaleX, scaleY));

    createMuteToggle(this, "backgroundmp3");

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
        align: "left",
        wordWrap: { width: 420 },
      })
      .setOrigin(0.5);

    const buttonColor = "#e9bef7";
    const disabledButton = "#8b6197";

    const nextButton = this.add
      .text(this.scale.width / 2 + 340, 600, "Next", {
        fontSize: "54px",
        color: buttonColor,
        fontFamily: "Blackletter",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const prevButton = this.add
      .text(this.scale.width / 2 - 340, 600, "Previous", {
        fontSize: "54px",
        color: disabledButton,
        fontFamily: "Blackletter",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const submitButton = this.add
      .text(this.scale.width / 2, 675, "Select Character", {
        fontSize: "54px",
        color: "#f3aaaa",
        fontFamily: "Blackletter",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const updateView = () => {
      currentData = characters[counter];

      if (currentCharacter) currentCharacter.destroy();
      currentCharacter = this.loadCharacter(currentData.image_name);

      bioText.setText(`BIO:\n${currentData.bio}`);

      prevButton.setColor(counter <= 0 ? disabledButton : buttonColor);
      nextButton.setColor(
        counter >= characters.length - 1 ? disabledButton : buttonColor
      );
    };

    nextButton.on("pointerdown", () => {
      if (counter >= characters.length - 1) return;
      counter += 1;
      updateView();
    });

    prevButton.on("pointerdown", () => {
      if (counter <= 0) return;
      counter -= 1;
      updateView();
    });

    submitButton.on("pointerdown", () => {
      this.scene.start("EncounterScene", {
        selectedIndex: counter,
        mode: "solo",
        difficulty: "easy",
      });
    });
  }
}