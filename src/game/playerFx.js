export function playerFx(scene, playerSprites, onComplete) {
  this.cameras.main.shake(120, 0.01);

  const startX = playerSprites.x;
  const startY = playerSprites.y;
  const originalScaleX = playerSprites.scaleX;
  const originalScaleY = playerSprites.scaleY;

  scene.tweens.killTweensOf(playerSprites);

  this.tweens.add({
    targets: this.monster,
    x: this.monster.x - 18,
    duration: 45,
    yoyo: true,
    ease: "Linear",
  });
  this.add.text(250, 300, "-30");
}
