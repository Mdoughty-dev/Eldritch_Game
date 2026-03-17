import Phaser from 'phaser';
import background from '../assets/background.png';
import victory from '../assets/victory.png';
import buttonBg from '../assets/buttonNormal.png';
import activeButton from '../assets/buttonhighlight.png';
import mute from '../assets/mute.png';
import victoryMusic from '../assets/victory.mp3';
import createMuteToggle from '../game/ui/BackgroundMusicToggle';

export default class VictoryPage extends Phaser.Scene {
	constructor() {
		super('VictoryPage');
	}

	preload() {
		this.load.image('background', background);
		this.load.image('victory', victory);
		this.load.image('buttonBg', buttonBg);
		this.load.image('activeButton', activeButton);
		this.load.audio('victoryMusic', victoryMusic);
		this.load.image('mute', mute);
	}

	create() {
		this.createBackground();
		createMuteToggle(this, 'victoryMusic');

		const victoryImg = this.add
			.image(this.scale.width / 2, this.scale.height / 2, 'victory')
			.setOrigin(0.5)
			.setScale(0.5);

		const victoryTitle = this.add
			.text(this.scale.width / 2, 100, 'Victory', {
				fontSize: '64px',
				fontFamily: 'Blackletter',
				color: '#FFFFFF',
			})
			.setOrigin(0.5);

		this.createContinueButton();
	}

	createBackground() {
		const background = this.add.image(0, 0, 'background').setOrigin(0);
		const scaleX = this.scale.width / background.width;
		const scaleY = this.scale.height / background.height;
		background.setScale(Math.max(scaleX, scaleY));
	}

	createContinueButton() {
		const continueButton = this.add
			.text(this.scale.width / 2, 650, 'Continue', {
				fontSize: '32px',
				color: '#FFFFFF',
				fontFamily: 'Blackletter',
			})
			.setOrigin(0.5)
			.setDepth(4);

		const buttonBg = this.add
			.image(this.scale.width / 2, 650, 'buttonBg')
			.setOrigin(0.5)
			.setDepth(2)
			.setScale(0.4);

		const activeButton = this.add
			.image(this.scale.width / 2, 650, 'activeButton')
			.setOrigin(0.5)
			.setDepth(0)
			.setScale(0.181, 0.2);

		buttonBg.setInteractive({ useHandCursor: true });
		buttonBg
			.on('pointerdown', () => {
				this.sound.stopAll();
				this.scene.start('ComingSoon');
			})
			.on('pointerover', () => activeButton.setDepth(3))
			.on('pointerout', () => activeButton.setDepth(0));
	}
}
