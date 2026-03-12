export default function applyDamage(scene, healthBar, maxHealthBar) {
	return function (damage = 100, isPlayer, currentHealth, maxHealth = 1000) {
		let remaining = Math.max(0, currentHealth - damage);

		scene.tweens.add({
			targets: healthBar,
			width: (remaining / maxHealth) * maxHealthBar,
			duration: 500,
			ease: 'Sine.easeInOut',
		});

		if (remaining <= 0) {
			scene.time.addEvent({
				delay: 1000,
				callback: () =>
					scene.scene.start(isPlayer ? 'GameOver' : 'VictoryPage'),
			});
		}

		return remaining;
	};
}
