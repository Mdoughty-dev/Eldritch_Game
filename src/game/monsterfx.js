export function playMonsterHitFx(
	scene,
	monsterSprite,
	monsterDamage,
	onComplete,
) {
	if (!monsterSprite) return;

	const startX = monsterSprite.x;
	const startY = monsterSprite.y;
	const originalScaleX = monsterSprite.scaleX;
	const originalScaleY = monsterSprite.scaleY;

	scene.tweens.killTweensOf(monsterSprite);

	monsterSprite.clearTint();
	monsterSprite.setTint(0xff4444);
	monsterSprite.setScale(originalScaleX * 1.08, originalScaleY * 1.08);

	scene.tweens.add({
		targets: monsterSprite,
		x: startX + 18,
		duration: 45,
		yoyo: true,
		repeat: 4,
		onComplete: () => {
			monsterSprite.setPosition(startX, startY);
			monsterSprite.clearTint();
			monsterSprite.setScale(originalScaleX, originalScaleY);

			if (onComplete) onComplete();
		},
	});

	const damagePopup = scene.add.text(920, 200, `${monsterDamage}`, {
		fontSize: '32px',
	});
	const xDirection = Math.random() * (250, -150) + 970;

	scene.tweens.add({
		targets: damagePopup,
		x: xDirection,
		y: 150,
		duration: 500,
		ease: 'Linear',

		onComplete: () => {
			damagePopup.destroy();
		},
	});
}
