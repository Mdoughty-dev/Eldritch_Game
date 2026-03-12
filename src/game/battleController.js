import applyDamage from './battleLogic';

export default function battleController(scene, playerHB, monsterHB) {
	const controller = {};

	controller.applyDamage = applyDamage(
		scene,
		playerHB.healthBar,
		playerHB.healthNum,
		playerHB.healthBar.width,
	);

	controller.applyMonsterDamage = applyDamage(
		scene,
		monsterHB.healthBar,
		monsterHB.healthNum,
		monsterHB.healthBar.width,
	);

	return controller;
}
