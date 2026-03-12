import Phaser from 'phaser';
import backgroundImg from '../assets/background.png';
import { createEncounterUI } from '../game/ui/encounterUi';
import { characters } from '../game/data/characterData';
import { monsters } from '../game/data/monsterData';
import { questions } from '../game/data/questionData';
import battleController from '../game/battleController';
import backgroundmp3 from '../assets/background.mp3';
import createMuteToggle from '../game/ui/BackgroundMusicToggle';
import mute from '../assets/mute.png';

export default class EncounterScene extends Phaser.Scene {
	constructor() {
		super('EncounterScene');
	}

	init(data) {
		this.selectedIndex = data?.selectedIndex ?? 0;
		this.difficulty = data?.difficulty ?? 'easy';
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
		this.questionPool = questions.filter(
			(question) => question.difficulty === this.difficulty,
		);
	}

	preload() {
		this.load.image('bg', backgroundImg);
		this.load.audio('backgroundmp3', backgroundmp3);
		this.load.image('mute', mute);
	}

	create() {
		this.createBackground();
		this.createCharacters();
		this.ui = createEncounterUI(this, {
			width: this.scale.width,
			height: this.scale.height,
			onAnswer: (i) => {
				console.log('clicked answer', i);
				console.log('correct answer index', this.currentQuestion.correctIndex);
				if (i === this.currentQuestion.correctIndex) {
					const newHp = this.controller.applyMonsterDamage(
						10,
						false,
						this.monsterStats.hp,
						this.monsterStats.maxHp,
					);
					this.monsterStats.hp = newHp;
				} else {
					const newHp = this.controller.applyDamage(
						10,
						true,
						this.playerStats.hp,
						this.playerStats.maxHp,
					);
					this.playerStats.hp = newHp;
				}
				this.ui.setHud({
					player: this.playerStats,
					monster: this.monsterStats,
				});
			},
		});

		this.controller = battleController(
			this,
			this.ui.playerHealthBar,
			this.ui.monsterHealthBar,
		);

		this.ui.setHud({ player: this.playerStats, monster: this.monsterStats });
		this.showQuestion();
		this.ui.setTimer('');
	}

	createBackground() {
		const bg = this.add.image(0, 0, 'bg').setOrigin(0);
		const scaleX = this.scale.width / bg.width;
		const scaleY = this.scale.height / bg.height;
		bg.setScale(Math.max(scaleX, scaleY));
	}

	formatQuestion(question) {
		return {
			question_id: question.question_id,
			prompt: question.prompt,
			options: [
				question.option_a,
				question.option_b,
				question.option_c,
				question.option_d,
			],
			correctIndex: ['a', 'b', 'c', 'd'].indexOf(question.correct_option),
		};
	}

	showQuestion() {
		if (!this.questionPool.length) return;
		const firstQuestion = this.questionPool[0];
		this.currentQuestion = this.formatQuestion(firstQuestion);
		this.ui.setQuestion(this.currentQuestion);
	}

	createCharacters() {
		this.add
			.image(250, 380, this.player.image_name)
			.setOrigin(0.5)
			.setScale(0.3);
		this.add
			.image(980, 380, this.monster.image_name)
			.setOrigin(0.5)
			.setScale(0.5);
	}
}
