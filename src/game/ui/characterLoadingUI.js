export function createPlayerSprites(scene, groupPlayers) {
  const positionsByCount = {
    1: [{ x: 250, y: 380 }],
    2: [
      { x: 220, y: 330 },
      { x: 300, y: 430 },
    ],
    3: [
      { x: 210, y: 300 },
      { x: 280, y: 380 },
      { x: 350, y: 460 },
    ],
    4: [
      { x: 190, y: 280 },
      { x: 250, y: 360 },
      { x: 320, y: 430 },
      { x: 390, y: 500 },
    ],
  };

  if (!groupPlayers.length) return [];

  const party = groupPlayers.slice(0, 4);
  const positions = positionsByCount[party.length] ?? positionsByCount[1];

  return party.map((player, index) => {
    const imageName = player?.character?.image_name;
    if (!imageName) return null;
    if (!scene.textures.exists(imageName)) return null;

    const { x, y } = positions[index];

    return scene.add
      .image(x, y, imageName)
      .setOrigin(0.5)
      .setScale(0.3);
  }).filter(Boolean);
}