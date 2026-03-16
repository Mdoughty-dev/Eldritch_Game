export default function createHealthBar(scene, x, y, remainingHealth) {
	const backgroundBar = scene.add
		.rectangle(x, y, 280, 30, 0x000000)
		.setOrigin(0.5);
	const healthBar = scene.add.rectangle(x, y, 250, 35, 0xff0000).setOrigin(0.5);

	return { backgroundBar, healthBar };
}
