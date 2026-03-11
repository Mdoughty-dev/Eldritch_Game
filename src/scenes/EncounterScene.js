import Phaser from "phaser";
import backgroundImg from "../assets/background.png";
import { createEncounterUI } from "../game/ui/encounterUi";
import backgroundmp3 from "../assets/background.mp3";
import createMuteToggle from "../game/ui/BackgroundMusicToggle";
import mute from "../assets/mute.png";

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
    this.load.audio("backgroundmp3", backgroundmp3);
    this.load.image("mute", mute);
  }

  create() {
    this.createBackground();
    createMuteToggle(this, "backgroundmp3");

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
}
