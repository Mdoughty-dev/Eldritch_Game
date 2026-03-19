import Phaser from "phaser";
import createMuteToggle from "../game/ui/BackgroundMusicToggle";

export default class LeaderboardScene extends Phaser.Scene {
  constructor() {
    super("LeaderboardScene");
  }

  init(data) {
    this.offsetValue = data.offsetValue || 0;
  }

  async create() {
    const bg = this.add.image(0, 0, "background").setOrigin(0);
    const scaleX = this.scale.width / bg.width;
    const scaleY = this.scale.height / bg.height;
    bg.setScale(Math.max(scaleX, scaleY));

    createMuteToggle(this, "backgroundmp3");

    this.add
      .text(this.scale.width / 2, 100, "Leaderboard", {
        fontSize: "64px",
        fontFamily: "Blackletter",
        color: "#FFFFFF",
      })
      .setOrigin(0.5);

    // let offsetValue = 0;

    const lengthResponse = await fetch(
      `https://eldritch-backend.onrender.com/api/leaderboard?offset=${this.offsetValue + 10}`,
    );
    const lengthData = await lengthResponse.json();

    this.nextLeaderboardLength = lengthData.length;

    console.log("next board", this.nextLeaderboardLength);

    const response = await fetch(
      `https://eldritch-backend.onrender.com/api/leaderboard?offset=${this.offsetValue}`,
    );
    const leaderboardData = await response.json();

    this.renderLeaderboard(leaderboardData);

    this.createNextButton();
    this.createPreviousButton();
  }

  renderLeaderboard(leaderboardData) {
    let index = 0;

    for (let player of leaderboardData) {
      const score =
        player.easy_questions_correct * 10 +
        player.medium_questions_correct * 20 +
        player.hard_questions_correct * 30;

      const accuracy =
        ((player.easy_questions_correct +
          player.medium_questions_correct +
          player.hard_questions_correct) *
          100) /
        player.total_questions_attempted;

      this.add.text(
        100,
        160 + index * 40,
        `${index + 1 + this.offsetValue}. ${player.display_name} - ${score} - ${accuracy.toFixed(2)}%`,
        {
          fontSize: "28px",
          color: "#D8D8FF",
        },
      );
      index += 1;
    }
  }

  createNextButton() {
    const buttonBgNext = this.add
      .image((this.scale.width * 3) / 4, 600, "buttonBg")
      .setOrigin(0.5);
    buttonBgNext
      .setScale(0.5)
      .setDepth(1)
      .on("pointerout", () => {
        buttonNextActive.setDepth(0);
      });

    const buttonNextActive = this.add
      .image((this.scale.width * 3) / 4, 600, "buttonHighlight")
      .setOrigin(0.5)
      .setDepth(0)
      .setScale(0.225, 0.245);

    const nextButton = this.add
      .text((this.scale.width * 3) / 4, 600, "Next", {
        fontSize: "32px",
        color: "#FFFFFF",
        fontFamily: "Blackletter",
      })
      .setOrigin(0.5)
      .setDepth(2);

    if (this.nextLeaderboardLength === 0) {
      buttonBgNext.setInteractive({ useHandCursor: false });
    } else {
      buttonBgNext
        .setScale(0.5)
        .setDepth(1)
        .on("pointerover", () => {
          buttonNextActive.setDepth(2);
        })
        .on("pointerout", () => {
          buttonNextActive.setDepth(0);
        });

      buttonBgNext.setInteractive({ useHandCursor: true });
      buttonBgNext.on("pointerdown", () => {
        console.log("Next button is pressed");
        this.scene.restart({ offsetValue: this.offsetValue + 10 });
      });
    }
  }
  createPreviousButton() {
    const buttonBgPrevious = this.add
      .image(this.scale.width / 4, 600, "buttonBg")
      .setOrigin(0.5);
    buttonBgPrevious
      .setScale(0.5)
      .setDepth(1)
      .on("pointerout", () => {
        buttonPreviousActive.setDepth(0);
      });

    const buttonPreviousActive = this.add
      .image(this.scale.width / 4, 600, "buttonHighlight")
      .setOrigin(0.5)
      .setDepth(0)
      .setScale(0.225, 0.245);

    const previousButton = this.add
      .text(this.scale.width / 4, 600, "Previous", {
        fontSize: "32px",
        color: "#FFFFFF",
        fontFamily: "Blackletter",
      })
      .setOrigin(0.5)
      .setDepth(2);
    if (this.offsetValue === 0) {
      buttonBgPrevious.setInteractive({ useHandCursor: false });
    } else {
      buttonBgPrevious
        .setScale(0.5)
        .setDepth(1)
        .on("pointerover", () => {
          buttonPreviousActive.setDepth(2);
        })
        .on("pointerout", () => {
          buttonPreviousActive.setDepth(0);
        });
      //   const buttonPreviousActive = this.add
      //     .image(this.scale.width / 2, 700, "buttonHighlight")
      //     .setOrigin(0.5)
      //     .setDepth(0)
      //     .setScale(0.225, 0.245);
      buttonBgPrevious.setInteractive({ useHandCursor: true });
      buttonBgPrevious.on("pointerdown", () => {
        console.log("Previous button is pressed");
        this.scene.restart({ offsetValue: this.offsetValue - 10 });
      });
    }
  }
}
