export function createEncounterUI(scene, opts = {}) {
  const { width = scene.scale.width, height = scene.scale.height, onAnswer = () => {} } = opts;
  const ui = {};

  ui.playerHpText = scene.add.text(30, 20, "HP: --/--", {
    fontSize: "24px",
    color: "#ffffff",
  });

  ui.monsterHpText = scene.add.text(width - 240, 20, "MON: --/--", {
    fontSize: "24px",
    color: "#ffffff",
  });

  ui.panel = scene.add
    .rectangle(width / 2, height - 90, width - 80, 190, 0x000000, 0.45)
    .setStrokeStyle(2, 0x666666, 0.7);

  ui.questionText = scene.add.text(80, height - 160, "", {
    fontSize: "26px",
    color: "#d8d8ff",
    wordWrap: { width: width - 420 },
  });

  ui.timerText = scene.add.text(width - 240, height - 160, "", {
    fontSize: "26px",
    color: "#d8d8ff",
  });

  ui.answerButtons = [];

  for (let i = 0; i < 4; i++) {
    const btn = scene.add
      .text(90, height - 110 + i * 38, "", {
        fontSize: "22px",
        color: "#ffffff",
      })
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => btn.setAlpha(0.8))
      .on("pointerout", () => btn.setAlpha(1))
      .on("pointerdown", () => onAnswer(i));

    ui.answerButtons.push(btn);
  }

  ui.setQuestion = (q = {}) => {
    ui.questionText.setText(q.prompt ?? "");

    ui.answerButtons.forEach((btn, i) => {
      const optionText = q.options?.[i] ?? "";
      btn.setText(optionText ? `${i + 1}. ${optionText}` : "");
      btn.setColor("#ffffff");
      btn.setAlpha(1);
      btn.removeInteractive();
      btn.setInteractive({ useHandCursor: true });
    });
  };

  ui.lockAnswers = () => {
    ui.answerButtons.forEach((b) => b.disableInteractive());
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
    ui.playerHpText.setText(`HP: ${player.hp ?? "--"}/${player.maxHp ?? "--"}`);
    ui.monsterHpText.setText(`MON: ${monster.hp ?? "--"}/${monster.maxHp ?? "--"}`);
  };

  ui.showEndOverlay = (msg = "", onContinue) => {
    const overlay = scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.65);

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