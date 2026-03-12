import Phaser from 'phaser';
import characterSceneSolo from '../scenes/characterSceneSolo';
import HomePage from '../scenes/HomePage';
import ComingSoon from '../scenes/ComingSoon';
import EncounterScene from '../scenes/EncounterScene';
import VictoryPage from '../scenes/Victory';
import GameOver from '../scenes/Gameover';

export function createPhaserGame(parentId) {
	return new Phaser.Game({
		type: Phaser.AUTO,
		parent: parentId,
		width: 1280,
		height: 720,
		backgroundColor: '#0b0b10',
		scene: [
			HomePage,
			characterSceneSolo,
			EncounterScene,
			VictoryPage,
			GameOver,
			ComingSoon,
		],
		scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
	});
}
