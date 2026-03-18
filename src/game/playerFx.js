import { useCallback } from "react";

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
  scene.sound.play("hitFx", { volume: 0.1 });

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
    ease: "Linear",
  });
  const damagePopup = scene.add.text(250, 200, `${playerDamage}`, {
    fontSize: "32px",
  });
  const xDirection = Math.random() * (250, -150) + 300;

  scene.tweens.add({
    targets: damagePopup,
    x: xDirection,
    y: 150,
    duration: 500,
    ease: "Linear",

    onComplete: () => {
      damagePopup.destroy();
      if (onComplete) onComplete();
    },
  });
}

export function playPlayerIdleFx(scene, playerSprites = []) {
  return playerSprites.map((sprite, index) => {
    if (!sprite) return null;

    scene.tweens.killTweensOf(sprite);

    const baseY = sprite.y;
    const floatOffset = 6 + index * 2;
    const delay = index * 120;

    return scene.tweens.add({
      targets: sprite,
      y: baseY - floatOffset,
      duration: 1000,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
      delay,
    });
  });
}

export function stopPlayerIdleFx(scene, playerSprites = [], idleTweens = []) {
  idleTweens.forEach((tween) => {
    if (tween) tween.stop();
  });

  playerSprites.forEach((sprite) => {
    if (!sprite) return;
    scene.tweens.killTweensOf(sprite);
  });
}
