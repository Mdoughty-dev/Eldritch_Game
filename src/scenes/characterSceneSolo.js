import Phaser from 'phaser';
import createMuteToggle from '../game/ui/BackgroundMusicToggle';
import { characters } from '../game/data/characterData';

export default class CharacterSceneSolo extends Phaser.Scene {
	constructor() {
		super('characterSceneSolo');
	}

	loadCharacter(imageKey) {
		const character = this.add
			.image(this.scale.width / 2, 450, imageKey)
			.setOrigin(0.5);

		character.setScale(0.4);
		return character;
	}

	create() {
		this.playerName = localStorage.getItem('eldritchPlayerName') || '';

		const bg = this.add.image(0, 0, 'background').setOrigin(0);
		const scaleX = this.scale.width / bg.width;
		const scaleY = this.scale.height / bg.height;
		bg.setScale(Math.max(scaleX, scaleY));

		createMuteToggle(this, 'backgroundmp3');

		const title = this.add
			.text(this.scale.width / 2, 125, 'Choose your Character', {
				fontSize: '72px',
				fontFamily: 'Georgia, "Times New Roman", serif',
				fontStyle: 'bold',
				color: '#d8d8ff',
				stroke: '#120c1c',
				strokeThickness: 6,
			})
			.setOrigin(0.5);

		title.setShadow(4, 4, '#000000', 8, true, true);

		this.nameText = this.add
			.text(
				this.scale.width / 2,
				200,
				this.playerName ? `Name: ${this.playerName}` : 'Name: Not set',
				{
					fontSize: '28px',
					color: '#ffffff',
				},
			)
			.setOrigin(0.5);

		const buttonColor = '#e9bef7';
		const disabledButton = '#8b6197';

		let counter = 0;
		let currentData = characters[counter];
		let currentCharacter = this.loadCharacter(currentData.image_name);

		const bioText = this.add
			.text(1000, 450, `BIO:\n${currentData.bio}`, {
				fontSize: '24px',
				color: '#e8e8fc',
				backgroundColor: 'rgba(0, 0, 0, 0.28)',
				align: 'left',
				wordWrap: { width: 420 },
			})
			.setOrigin(0.5);

		const nextButton = this.add
			.text(this.scale.width / 2 + 340, 600, 'Next', {
				fontSize: '54px',
				color: buttonColor,
				fontFamily: 'Blackletter',
			})
			.setOrigin(0.5)
			.setInteractive({ useHandCursor: true });

		const prevButton = this.add
			.text(this.scale.width / 2 - 340, 600, 'Previous', {
				fontSize: '54px',
				color: disabledButton,
				fontFamily: 'Blackletter',
			})
			.setOrigin(0.5)
			.setInteractive({ useHandCursor: true });

		const submitButton = this.add
			.text(this.scale.width / 2, 675, 'Select Character', {
				fontSize: '54px',
				color: '#f3aaaa',
				fontFamily: 'Blackletter',
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
				counter >= characters.length - 1 ? disabledButton : buttonColor,
			);
		};

		nextButton.on('pointerdown', () => {
			if (counter >= characters.length - 1) return;
			counter += 1;
			updateView();
		});

		prevButton.on('pointerdown', () => {
			if (counter <= 0) return;
			counter -= 1;
			updateView();
		});

		submitButton.on('pointerdown', () => {
			this.openNamePrompt(counter);
		});
	}

	openNamePrompt(selectedIndex) {
		const { width, height } = this.scale;

		const overlay = this.add
			.rectangle(0, 0, width, height, 0x000000, 0.55)
			.setOrigin(0)
			.setDepth(100)
			.setInteractive();

		const panel = this.add
			.rectangle(width / 2, height / 2, 500, 240, 0x111111, 0.78)
			.setStrokeStyle(2, 0xd8d8ff, 0.8)
			.setDepth(101);

		const titleText = this.add
			.text(width / 2, height / 2 - 78, 'Enter Name', {
				fontSize: '32px',
				color: '#d8d8ff',
				fontStyle: 'bold',
			})
			.setOrigin(0.5)
			.setDepth(102);

		const inputHtml = `
      <input
        type="text"
        id="modal-input"
        value="${this.escapeHtml(this.playerName)}"
        placeholder="Type here..."
        maxlength="16"
        autocapitalize="words"
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
        style="
          width: 320px;
          height: 44px;
          padding: 0 14px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.45);
          outline: none;
          background: rgba(34,34,51,0.88);
          color: white;
          font-size: 24px;
          font-family: Georgia, 'Times New Roman', serif;
          box-sizing: border-box;
          text-align: left;
        "
      />
    `;

		const inputDom = this.add
			.dom(width / 2, height / 2 - 8)
			.createFromHTML(inputHtml)
			.setDepth(103);

		const inputEl = inputDom.node.querySelector('#modal-input');

		const saveButton = this.add
			.rectangle(width / 2 - 80, height / 2 + 78, 120, 45, 0x2d6a4f, 0.9)
			.setStrokeStyle(1, 0xffffff, 0.5)
			.setInteractive({ useHandCursor: true })
			.setDepth(101);

		const saveText = this.add
			.text(width / 2 - 80, height / 2 + 78, 'Start', {
				fontSize: '22px',
				color: '#ffffff',
			})
			.setOrigin(0.5)
			.setDepth(102);

		const cancelButton = this.add
			.rectangle(width / 2 + 80, height / 2 + 78, 120, 45, 0x7f1d1d, 0.9)
			.setStrokeStyle(1, 0xffffff, 0.5)
			.setInteractive({ useHandCursor: true })
			.setDepth(101);

		const cancelText = this.add
			.text(width / 2 + 80, height / 2 + 78, 'Cancel', {
				fontSize: '22px',
				color: '#ffffff',
			})
			.setOrigin(0.5)
			.setDepth(102);

		const modalItems = [
			overlay,
			panel,
			titleText,
			inputDom,
			saveButton,
			saveText,
			cancelButton,
			cancelText,
		];

		const closeModal = () => {
			modalItems.forEach((item) => item.destroy());
		};

		const handleSubmit = () => {
			const value = inputEl.value.trim();
			if (!value) return;

			localStorage.setItem('eldritchPlayerName', value);
			this.playerName = value;
			this.nameText.setText(`Name: ${value}`);

			closeModal();

			this.scene.start('SoloSocketBootstrapScene', {
				selectedIndex,
				playerName: value,
			});
		};

		inputEl.addEventListener('keydown', (event) => {
			if (event.key === 'Enter') handleSubmit();
			if (event.key === 'Escape') closeModal();
		});

		saveButton.on('pointerdown', () => {
			handleSubmit();
		});

		cancelButton.on('pointerdown', () => {
			closeModal();
		});

		this.time.delayedCall(50, () => {
			inputEl.focus();
			inputEl.select();
		});
	}

	escapeHtml(value = '') {
		return String(value)
			.replace(/&/g, '&amp;')
			.replace(/"/g, '&quot;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');
	}
}