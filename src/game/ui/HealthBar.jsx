export default function createHealthBar(scene, x) {
	scene.add.rectangle(x, 700, 205, 55, 0x000000);
	const currentHealth = scene.add.rectangle(x, 700, 200, 50, 0xff0000);

	const attackButton = scene.add
		.text(scene.scale.width / 2, 650, 'Attack', {
			fontSize: '32px',
			color: '#FFFFFF',
			backgroundColor: '#494949',
			fontFamily: 'Blackletter',
		})
		.setOrigin(0.5);

	attackButton.setInteractive({ useHandCursor: true });
	attackButton.on('pointerdown', () => {
		const damage = 30;
		if (currentHealth.width - damage > 0) {
			scene.tweens.add({
				targets: currentHealth,
				width: currentHealth.width - damage,
				duration: 500,
				ease: 'Sine.easeInOut',
			});
		} else if (currentHealth.width - damage <= 0) {
			scene.tweens.add({
				targets: currentHealth,
				width: 0,
				duration: 500,
				ease: 'Sine.easeInOut',
			});
		}
		console.log('attack button is pressed');
	});
}
