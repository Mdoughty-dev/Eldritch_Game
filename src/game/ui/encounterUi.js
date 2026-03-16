import playerHealthBar from "../ui/HealthBar";
import monsterHealthBar from "../ui/HealthBar";

export function createEncounterUI(scene, opts = {}) {
  const {
    width = scene.scale.width,
    height = scene.scale.height,
    onAnswer = () => {},
  } = opts;

  const ui = {};

  ui.playerHpText = scene.add.text(30, 20, "HP: --/--", {
    fontSize: "24px",
    color: "#ffffff",
  });

  ui.playerHealthBar = playerHealthBar(scene, 150, 85, 1000);

  ui.monsterHpText = scene.add.text(width - 240, 20, "MON: --/--", {
    fontSize: "24px",
    color: "#ffffff",
  });

  ui.monsterHealthBar = monsterHealthBar(scene, 1140, 85, 1000);

  const panelHeight = 220;
  const panelY = height - 120;
  const panelTop = panelY - panelHeight / 2;

  ui.panel = scene.add
    .rectangle(width / 2, panelY, width - 80, panelHeight, 0x000000, 0.45)
    .setStrokeStyle(2, 0x666666, 0.7);

  ui.questionText = scene.add.text(80, panelTop + 15, "", {
    fontSize: "26px",
    color: "#d8d8ff",
    wordWrap: { width: width - 420 },
  });

  ui.timerText = scene.add.text(width - 240, panelTop + 15, "", {
    fontSize: "26px",
    color: "#d8d8ff",
  });

  ui.answerButtons = [];

  const answerStartY = panelTop + 120;
  const answerGap = 65;

  for (let i = 0; i < 4; i++) {
    let x = width * 0.25;
    let y = answerStartY + i * answerGap;
    if (i >= 2) {
      x = width * 0.75;
      y -= answerGap * 2;
    }

    const buttonBg = scene.add
      .image(x, y, "buttonBg")
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setScale(0.52, 0.38)
      .setDepth(1)
      .on("pointerdown", () => onAnswer(i))
      .on("pointerover", () => btn.setAlpha(0.8))
      .on("pointerout", () => btn.setAlpha(1));

    const btn = scene.add
      .text(x, y, "", {
        fontSize: "24px",
        color: "#FFFFFF",
        wordWrap: { width: width - 180 },
      })
      .setOrigin(0.5)
      .setDepth(3)
      .on("pointerdown", () => onAnswer(i));

    ui.answerButtons.push(btn);
  }

  ui.lockAnswers = () => {
    ui.answerButtons.forEach((btn) => {
      btn.disableInteractive();
    });
  };

  ui.lockAnswers = () => {
    ui.answerButtons.forEach((btn) => {
      btn.disableInteractive();
    });
  };

  ui.unlockAnswers = () => {
    ui.answerButtons.forEach((btn) => {
      btn.setAlpha(1);
      btn.setColor("#ffffff");

      if (!btn.input) {
        btn.setInteractive({ useHandCursor: true });
      } else {
        btn.input.enabled = true;
      }
    });
  };

  ui.setQuestion = (q = {}) => {
    ui.questionText.setText(q.prompt ?? "");

    ui.answerButtons.forEach((btn, i) => {
      const optionText = q.options?.[i] ?? "";
      btn.setText(optionText ? `${optionText}` : "");
      btn.setColor("#ffffff");
      btn.setAlpha(1);

      if (!btn.input) {
        btn.setInteractive({ useHandCursor: true });
      } else {
        btn.input.enabled = true;
      }
    });
  };

  ui.showAnswerFeedback = (correctIndex, chosenIndex) => {
    ui.answerButtons.forEach((b, i) => {
      if (i === correctIndex) b.setColor("#7CFF9A");
      else if (i === chosenIndex) b.setColor("#FF6B6B");
      else b.setAlpha(0.65);
    });
  };

  ui.setTimer = (timeLeft = "") => {
    ui.timerText.setText(timeLeft === "" ? "" : `Time: ${timeLeft}`);
  };

  ui.setHud = ({ player = {}, monster = {} } = {}) => {
    const playerHp = player.hp ?? 0;
    const playerMaxHp = player.maxHp ?? 1;
    const monsterHp = monster.hp ?? 0;
    const monsterMaxHp = monster.maxHp ?? 1;

    ui.playerHpText.setText(`HP: ${player.hp ?? "--"}/${player.maxHp ?? "--"}`);
    ui.monsterHpText.setText(
      `MON: ${monster.hp ?? "--"}/${monster.maxHp ?? "--"}`,
    );

    if (ui.playerHealthBar?.setHealth) {
      ui.playerHealthBar.setHealth(playerHp, playerMaxHp);
    }

    if (ui.monsterHealthBar?.setHealth) {
      ui.monsterHealthBar.setHealth(monsterHp, monsterMaxHp);
    }
  };

  ui.showEndOverlay = (msg = "", onContinue) => {
    const overlay = scene.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x000000,
      0.65,
    );

    const text = scene.add
      .text(width / 2, height / 2, msg, {
        fontSize: "64px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    scene.input.once("pointerdown", () => {
      overlay.destroy();
      text.destroy();
      onContinue?.();
    });
  };

  return ui;
}
