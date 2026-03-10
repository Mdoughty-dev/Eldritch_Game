import Phaser from 'phaser';
import background from '../assets/background.png';
import backgroundmp3 from '../assets/background.mp3';
import createMuteToggle from '../game/ui/BackgroundMusicToggle';
import mute from '../assets/mute.png';

export default class ComingSoon extends Phaser.Scene {
	constructor() {
		super(ComingSoon);
	}

	preload() {
		this.load.image('background', background);
		this.load.audio('backgroundmp3', backgroundmp3);
		this.load.image('mute', mute);
	}

	create() {
		this.createBackground();
		this.createList();
		createMuteToggle(this, 'backgroundmp3');

		this.add
			.text(this.scale.width / 2, 100, 'Coming Soon ...', {
				fontSize: '64px',
				fontFamily: 'Blackletter',
				color: '#FFFFFF',
			})
			.setOrigin(0.5);
	}

	createBackground() {
		const background = this.add.image(0, 0, 'background').setOrigin(0);
		const scaleX = this.scale.width / background.width;
		const scaleY = this.scale.height / background.height;
		background.setScale(Math.max(scaleX, scaleY));
	}

	createList() {
		this.add
			.text(
				this.scale.width / 2,
				250,
				'LootBox: unlock powerful artifacts - to assist in your fight against evil!',
				{
					fontSize: '32px',
					fontFamily: 'Blackletter',
					color: '#FFFFFF',
				},
			)
			.setOrigin(0.5);

		this.add
			.text(
				this.scale.width / 2,
				300,
				'Item Shop: Use your hard earned money to enhance your character!',
				{
					fontSize: '32px',
					fontFamily: 'Blackletter',
					color: '#FFFFFF',
				},
			)
			.setOrigin(0.5);

		this.add
			.text(
				this.scale.width / 2,
				350,
				'Character Skills: Empower your character with unique skills!',
				{
					fontSize: '32px',
					fontFamily: 'Blackletter',
					color: '#FFFFFF',
				},
			)
			.setOrigin(0.5);

		this.add
			.text(
				this.scale.width / 2,
				400,
				'New monsters: Encounter new horrors as you descend into MADNESS!',
				{
					fontSize: '32px',
					fontFamily: 'Blackletter',
					color: '#FFFFFF',
				},
			)
			.setOrigin(0.5);

		this.add
			.text(
				this.scale.width / 2,
				450,
				"Create your own quiz: Challage your allies' feeble knowledge!",
				{
					fontSize: '32px',
					fontFamily: 'Blackletter',
					color: '#FFFFFF',
				},
			)
			.setOrigin(0.5);

		this.add
			.text(
				this.scale.width / 2,
				500,
				'Haptic feedback: Feel the wrath of the abominations you face!',
				{
					fontSize: '32px',
					fontFamily: 'Blackletter',
					color: '#FFFFFF',
				},
			)
			.setOrigin(0.5);
	}
}
