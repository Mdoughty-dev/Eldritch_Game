export default function createMuteToggle(scene, music) {
	const soundManager = scene.sound;

	let backgroundMusic = soundManager.get(music);
	if (!backgroundMusic) {
		backgroundMusic = soundManager.add(music, {
			volume: 0.1,
			loop: true,
		});
	}

	if (!backgroundMusic.isPlaying) {
		backgroundMusic.play();
	}

	if (soundManager.mute) {
		backgroundMusic.pause();
	}

	const muteBackground = scene.add
		.image(1250, 30, 'mute', {
			width: '50px',
			height: '50px',
			color: '#FFFFFF',
		})
		.setOrigin(0.5);

	muteBackground.setInteractive({ useHandCursor: true });

	muteBackground.on('pointerdown', () => {
		if (backgroundMusic.isPlaying) {
			backgroundMusic.pause();
			soundManager.mute = true;
		} else {
			backgroundMusic.resume();
			soundManager.mute = false;
		}
	});
}
