import Phaser from "phaser";
import HomePage from "../scenes/HomePage";
import ComingSoon from "../scenes/ComingSoon";

export function createPhaserGame(parentId) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent: parentId,
    width: 1280,
    height: 720,
    backgroundColor: "#0b0b10",
    scene: [HomePage],
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  });
}
