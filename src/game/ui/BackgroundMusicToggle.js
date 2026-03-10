export default function createMuteToggle(scene, music) {
  const backgroundMusic = scene.sound.add(`${music}`, { volume: 0.1 });
  backgroundMusic.play();

  let musicIsPlaying = true;

  const muteBackground = scene.add
    .image(1200, 680, "mute", {
      width: "50px",
      height: "50px",
      color: "#ffffff",
    })
    .setOrigin(0.5);

  muteBackground.setInteractive({ useHandCursor: true });

  muteBackground.on("pointerdown", () => {
    if (musicIsPlaying) {
      musicIsPlaying = false;
      backgroundMusic.pause();
    } else {
      musicIsPlaying = true;
      backgroundMusic.resume();
    }
  });
}
