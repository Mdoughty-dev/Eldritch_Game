export default function createHealthBar(
	scene,
	x,
	y,
	maxHealth = 1000,
	damage = 100,
) {
	scene.add.rectangle(x, 700, 205, 55, 0x000000).setOrigin(0.5);
	const healthBar = scene.add
		.rectangle(x, 700, 200, 50, 0xff0000)
		.setOrigin(0.5);
	const maxHealthBar = healthBar.width;
	let remainingHealth = maxHealth;
	let healthNum = scene.add.text(50, 50, `${remainingHealth}`).setOrigin(0.5);

	const attackButton = scene.add
		.text(x, 650, 'Attack', {
			fontSize: '32px',
			color: '#FFFFFF',
			backgroundColor: '#494949',
			fontFamily: 'Blackletter',
		})
		.setOrigin(0.5);

	attackButton.setInteractive({ useHandCursor: true });
	attackButton.on('pointerdown', () => {
		if (remainingHealth <= 0) return;
		if (remainingHealth - damage > 0) {
			remainingHealth = remainingHealth - damage;
			scene.tweens.add({
				targets: healthBar,
				width: (remainingHealth / maxHealth) * maxHealthBar,
				duration: 500,
				ease: 'Sine.easeInOut',
			});
		} else if (remainingHealth - damage <= 0) {
			remainingHealth = 0;
			console.log("You're dead!");
			scene.tweens.add({
				targets: healthBar,
				width: 0,
				duration: 500,
				ease: 'Sine.easeInOut',
			});
		}
		healthNum.setText(`${remainingHealth}`);
		console.log('attack button is pressed');
	});
}
