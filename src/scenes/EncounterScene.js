import Phaser from "phaser";
import backgroundImg from "../assets/background.png";
import { createEncounterUI } from "../game/ui/encounterUi";
import { characters } from "../game/data/characterData";
import { monsters } from "../game/data/monsterData";

export default class EncounterScene extends Phaser.Scene {
  constructor() {
    super("EncounterScene");
  }

  init(data) {
    this.selectedIndex = data?.selectedIndex ?? 0;

    this.player = characters[this.selectedIndex];
    this.monster = monsters[0];

    this.playerStats = {
      hp: this.player.base_sanity,
      maxHp: this.player.base_sanity,
    };

    this.monsterStats = {
      hp: this.monster.max_hp,
      maxHp: this.monster.max_hp,
    };
  }

  preload() {
    this.load.image("bg", backgroundImg);
  }

  create() {
    this.createBackground();
    this.createCharacters();

    this.ui = createEncounterUI(this, {
      width: this.scale.width,
      height: this.scale.height,
      onAnswer: (i) => {
        console.log("clicked answer", i);
      },
    });

    this.ui.setHud({
      player: this.playerStats,
      monster: this.monsterStats,
    });

    this.ui.setQuestion({});
    this.ui.setTimer("");
  }

  createBackground() {
    const bg = this.add.image(0, 0, "bg").setOrigin(0);
    const scaleX = this.scale.width / bg.width;
    const scaleY = this.scale.height / bg.height;
    bg.setScale(Math.max(scaleX, scaleY));
  }

  createCharacters() {
    this.add
      .image(250, 430, this.player.image_name)
      .setOrigin(0.5)
      .setScale(0.4);

    this.add
      .image(980, 300, this.monster.image_name)
      .setOrigin(0.5)
      .setScale(0.4);
  }
}