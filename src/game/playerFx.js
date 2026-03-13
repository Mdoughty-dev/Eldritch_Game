import { useCallback } from 'react';

export function playerFx(
	scene,
	playerSprites,
	monsterSprite,
	playerDamage,
	onComplete,
) {
	scene.time.addEvent({
		delay: 10,
		repeat: 3,
		callback: () => {
			scene.cameras.main.shake(120, 0.01);
		},
	});

	scene.cameras.main.shake(120, 0.01);

	const startX = playerSprites.x;
	const startY = playerSprites.y;
	const originalScaleX = playerSprites.scaleX;
	const originalScaleY = playerSprites.scaleY;

	scene.tweens.killTweensOf(playerSprites);
	scene.tweens.killTweensOf(monsterSprite);

	scene.tweens.add({
		targets: monsterSprite,
		x: monsterSprite.x - 110,
		duration: 45,
		yoyo: true,
		ease: 'Linear',
	});
	const damagePopup = scene.add.text(250, 200, `${playerDamage}`, {
		fontSize: '32px',
	});
	const xDirection = Math.random() * (250, -150) + 300;

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
