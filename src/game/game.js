import Phaser from "phaser";
import characterSceneSolo from "../scenes/characterSceneSolo";
import HomePage from "../scenes/HomePage";
import ComingSoon from "../scenes/ComingSoon";
import EncounterScene from "../scenes/EncounterScene";
import Victory from "../scenes/Victory";
import GameOver from "../scenes/Gameover";
import GroupLobbyScene from "../scenes/groupLobbyScene";
import SoloSocketBootstrapScene from "../scenes/soloSocketBootstrapScene";
import IntroScene from "../scenes/intro";
import LeaderboardScene from "../scenes/LeaderboardScene";

export function createPhaserGame(parentId) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent: parentId,
    width: 1280,
    height: 720,
    backgroundColor: "#0b0b10",
    scene: [
      IntroScene,
      HomePage,
      characterSceneSolo,
      SoloSocketBootstrapScene,
      GroupLobbyScene,
      EncounterScene,
      Victory,
      GameOver,
      ComingSoon,
      LeaderboardScene,
    ],
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    dom: {
      createContainer: true,
    },
  });
}
