import Phaser from "phaser";
import backgroundImg from "../assets/background.png";
import backgroundmp3 from "../assets/background.mp3";
import mute from "../assets/mute.png";

import { createEncounterUI } from "../game/ui/encounterUi";
import createMuteToggle from "../game/ui/BackgroundMusicToggle";
import { createGroupEncounterController } from "../game/controllers/groupEncounterController";
import { createSoloEncounterController } from "../game/controllers/soloEncounterController";

export default class EncounterScene extends Phaser.Scene {
  constructor() {
    super("EncounterScene");
  }

  init(data) {
    this.sceneData = data ?? {};
    this.mode = this.sceneData.mode ?? "solo";
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
        this.controller?.handleAnswer(i);
      },
    });

    if (this.mode === "group") {
      this.controller = createGroupEncounterController(this, this.ui, this.sceneData);
    } else {
      this.controller = createSoloEncounterController(this, this.ui, this.sceneData);
    }

    this.controller.start();
  }

  createBackground() {
    const bg = this.add.image(0, 0, "bg").setOrigin(0);
    const scaleX = this.scale.width / bg.width;
    const scaleY = this.scale.height / bg.height;
    bg.setScale(Math.max(scaleX, scaleY));
  }

  shutdown() {
    this.controller?.shutdown?.();
  }

  destroy() {
    this.shutdown();
  }
}
