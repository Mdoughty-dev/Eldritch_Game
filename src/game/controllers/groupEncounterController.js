import battleController from '../battleController';
import applyDamage from '../battleLogic';
import { playerFx } from '../playerFx';
import {
  submitAnswer,
  clientReady,
  onRoundResult,
  offRoundResult,
  onGameEnded,
  offGameEnded,
  onRoundStarted,
  offRoundStarted,
} from '../net/groupApi';

import { createPlayerSprites } from '../ui/characterLoadingUI';
import {
  playMonsterHitFx,
  playMonsterIdleFx,
  stopMonsterIdleFx,
} from '../monsterfx';
import { playPlayerIdleFx, stopPlayerIdleFx } from '../playerFx';

export function createGroupEncounterController(scene, ui, sceneData) {
  const state = {
    roomCode: sceneData.roomCode ?? null,
    roundStartedPayload: sceneData.roundStartedPayload ?? null,
    countdownEvent: null,
    groupMonsterSprite: null,
    playerSprites: [],
    groupPlayers: sceneData.groupPlayers ?? [],
    currentQuestionId: null,
    roundDeadline: null,
    teamHp: null,
    teamHpMax: null,
    monsterMaxHp: null,
    currentMonsterHp: null,
    currentStageNumber: 1,
    isPlayingHitFx: false,
    battle: null,
    pendingRoundStartedPayload: null,
    pendingFxCount: 0,
    readyDelayDone: false,
    readyDelayEvent: null,
    monsterIdleTween: null,
    playerIdleTweens: [],
    pendingStageTransition: null,
    levelOverlay: null,
    speechBubbles: [],
    pendingIntroMessage: null,
  };

  function start() {
    if (!state.roundStartedPayload) {
      console.error("Missing roundStartedPayload for group mode");
      ui.setHud({});
      ui.setQuestion({});
      ui.setTimer("");
      return;
    }

    state.playerSprites = createPlayerSprites(scene, state.groupPlayers);
    state.playerIdleTweens = playPlayerIdleFx(scene, state.playerSprites);

    registerListeners();
    state.battle = battleController(
      scene,
      ui.playerHealthBar,
      ui.monsterHealthBar
    );

    const firstStageNumber = getStageNumberFromPayload(
      state.roundStartedPayload
    );

    showLevelOverlay(firstStageNumber, () => {
      state.pendingIntroMessage = getStageIntroMessage(firstStageNumber);
      applyRoundStartedPayload(state.roundStartedPayload);
    });
  }

  function handleAnswer(index) {
    const answerMap = ["a", "b", "c", "d"];
    const answer = answerMap[index];

    submitAnswer({
      questionId: state.currentQuestionId,
      answer,
    });

    ui.lockAnswers();
    console.log("submitted group answer:", answer);
  }

  function getDifficultyLabel(stageNumber) {
    if (stageNumber === 1) return "Level 1 - Easy";
    if (stageNumber === 2) return "Level 2 - Medium";
    if (stageNumber === 3) return "Level 3 - Hard";
    return `Level ${stageNumber}`;
  }

  function getStageNumberFromPayload(payload) {
    return (
      payload?.monster?.stage ??
      payload?.monster?.level ??
      payload?.gameState?.stage ??
      payload?.gameState?.level ??
      1
    );
  }

  function clearSpeechBubbles() {
    state.speechBubbles.forEach((bubble) => {
      bubble.bg?.destroy();
      bubble.text?.destroy();
    });
    state.speechBubbles = [];
  }

  function showTeamSpeech(message) {
    clearSpeechBubbles();

    state.playerSprites.forEach((sprite) => {
      if (!sprite || !sprite.active) return;

      const bubbleWidth = 150;
      const bubbleHeight = 42;
      const bubbleX = sprite.x + 100;
      const bubbleY = sprite.y - 150;

      const bg = scene.add
        .rectangle(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 0xffffff, 0.95)
        .setStrokeStyle(2, 0x222222, 1)
        .setDepth(1200)
        .setAlpha(0);

      const text = scene.add
        .text(bubbleX, bubbleY, message, {
          fontSize: "16px",
          color: "#111111",
          fontStyle: "bold",
          align: "center",
          wordWrap: { width: bubbleWidth - 16 },
        })
        .setOrigin(0.5)
        .setDepth(1201)
        .setAlpha(0);

      state.speechBubbles.push({ bg, text });

      scene.tweens.add({
        targets: [bg, text],
        alpha: 1,
        duration: 150,
        onComplete: () => {
          scene.time.delayedCall(1200, () => {
            scene.tweens.add({
              targets: [bg, text],
              alpha: 0,
              duration: 200,
              onComplete: () => {
                bg.destroy();
                text.destroy();
                state.speechBubbles = state.speechBubbles.filter(
                  (bubble) => bubble.bg !== bg
                );
              },
            });
          });
        },
      });
    });
  }

  function getRandomMessage(messages) {
    return messages[Math.floor(Math.random() * messages.length)];
  }

  function getStageIntroMessage(stageNumber) {
    if (stageNumber === 1) return "Damn it's a SewerBeast";
    if (stageNumber === 2) return "That is one ugly Thing!";
    if (stageNumber === 3) return "What the hell, is that";
    return null;
  }

  function showLevelOverlay(stageNumber, onComplete) {
    const text = getDifficultyLabel(stageNumber);

    const overlayBg = scene.add
      .rectangle(
        scene.scale.width / 2,
        scene.scale.height / 2,
        360,
        90,
        0x000000,
        0.75
      )
      .setStrokeStyle(2, 0xd8d8ff, 0.9)
      .setScrollFactor(0)
      .setDepth(1000)
      .setAlpha(0);

    const overlayText = scene.add
      .text(scene.scale.width / 2, scene.scale.height / 2, text, {
        fontSize: "28px",
        color: "#d8d8ff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1001)
      .setAlpha(0);

    state.levelOverlay = { overlayBg, overlayText };

    scene.tweens.add({
      targets: [overlayBg, overlayText],
      alpha: 1,
      duration: 200,
      onComplete: () => {
        scene.time.delayedCall(900, () => {
          scene.tweens.add({
            targets: [overlayBg, overlayText],
            alpha: 0,
            duration: 200,
            onComplete: () => {
              overlayBg.destroy();
              overlayText.destroy();
              state.levelOverlay = null;
              if (onComplete) onComplete();
            },
          });
        });
      },
    });
  }

  function applyRoundStartedPayload(payload) {
    const { monster, question, gameState } = payload;

    if (!monster || !question || !gameState) {
      console.error("Invalid roundStartedPayload:", payload);
      return;
    }

    clearSpeechBubbles();

    state.currentStageNumber = getStageNumberFromPayload(payload);
    state.currentQuestionId = question.id;
    state.roundDeadline = gameState.roundDeadline;
    state.teamHp = gameState.teamHp;
    state.teamHpMax ??= gameState.maxTeamHp ?? gameState.teamHp;
    state.monsterMaxHp = monster.maxHp;
    state.currentMonsterHp = monster.hp;

    if (!scene.textures.exists(monster.image_name)) {
      console.warn("Missing monster texture:", monster.image_name);
    }

    if (!state.groupMonsterSprite) {
      state.groupMonsterSprite = scene.add
        .image(980, 340, monster.image_name)
        .setOrigin(0.5)
        .setScale(0.5);
    } else {
      scene.tweens.killTweensOf(state.groupMonsterSprite);
      state.groupMonsterSprite.clearTint();
      state.groupMonsterSprite.setTexture(monster.image_name);
      state.groupMonsterSprite.setPosition(980, 340);
      state.groupMonsterSprite.setScale(0.5);
    }

    stopMonsterIdleFx(scene, state.groupMonsterSprite, state.monsterIdleTween);
    state.monsterIdleTween = playMonsterIdleFx(scene, state.groupMonsterSprite);

    ui.setHud({
      player: {
        hp: state.teamHp,
        maxHp: state.teamHpMax,
      },
      monster: {
        hp: monster.hp,
        maxHp: monster.maxHp,
      },
    });

    ui.unlockAnswers();

    ui.setQuestion({
      prompt: question.prompt,
      options: [
        question.options.a,
        question.options.b,
        question.options.c,
        question.options.d,
      ],
    });

    startRoundCountdown();

    if (state.pendingIntroMessage) {
      const message = state.pendingIntroMessage;
      state.pendingIntroMessage = null;
      scene.time.delayedCall(100, () => {
        showTeamSpeech(message);
      });
    }
  }

  function startRoundCountdown() {
    if (state.countdownEvent) {
      state.countdownEvent.remove(false);
    }

    const updateTimer = () => {
      const msLeft = state.roundDeadline - Date.now();
      const secondsLeft = Math.max(0, Math.ceil(msLeft / 1000));
      ui.setTimer(secondsLeft);
    };

    updateTimer();

    state.countdownEvent = scene.time.addEvent({
      delay: 250,
      loop: true,
      callback: () => {
        updateTimer();

        if (Date.now() >= state.roundDeadline) {
          ui.setTimer(0);
          state.countdownEvent.remove(false);
          state.countdownEvent = null;
        }
      },
    });
  }

  function swapMonster(nextMonster) {
    const nextMonsterMaxHp = nextMonster.maxHp ?? nextMonster.max_hp;

    state.monsterMaxHp = nextMonsterMaxHp;
    state.currentMonsterHp = nextMonsterMaxHp;

    if (state.battle) {
      state.battle.resetMonsterHp();
    }

    if (!scene.textures.exists(nextMonster.image_name)) {
      console.warn("Missing next monster texture:", nextMonster.image_name);
    }

    if (!state.groupMonsterSprite) {
      state.groupMonsterSprite = scene.add
        .image(980, 340, nextMonster.image_name)
        .setOrigin(0.5)
        .setScale(0.5);
    } else {
      scene.tweens.killTweensOf(state.groupMonsterSprite);
      state.groupMonsterSprite.clearTint();
      state.groupMonsterSprite.setTexture(nextMonster.image_name);
      state.groupMonsterSprite.setPosition(980, 340);
      state.groupMonsterSprite.setScale(0.5);
    }

    stopMonsterIdleFx(scene, state.groupMonsterSprite, state.monsterIdleTween);
    state.monsterIdleTween = playMonsterIdleFx(scene, state.groupMonsterSprite);
  }

  function runPendingStageTransitionIfNeeded() {
    if (!state.pendingStageTransition) return;

    const { nextMonster, stageNumber } = state.pendingStageTransition;
    state.pendingStageTransition = null;

    showLevelOverlay(stageNumber, () => {
      state.currentStageNumber = stageNumber;
      swapMonster(nextMonster);
      state.pendingIntroMessage = getStageIntroMessage(stageNumber);
      maybeFinishRoundFlow();
    });
  }

  function maybeFinishRoundFlow() {
    if (!state.readyDelayDone) return;
    if (state.pendingFxCount > 0) return;

    if (state.pendingStageTransition) {
      runPendingStageTransitionIfNeeded();
      return;
    }

    state.isPlayingHitFx = false;

    if (state.pendingRoundStartedPayload) {
      const nextPayload = state.pendingRoundStartedPayload;
      state.pendingRoundStartedPayload = null;
      applyRoundStartedPayload(nextPayload);
      return;
    }

    console.log("sending clientReady");
    clientReady();
  }

  function onRoundResultHandler(payload) {
    const correctIndex = ["a", "b", "c", "d"].indexOf(payload.correctOption);

    let chosenIndex = -1;
    const myUserId = localStorage.getItem("eldritchUserId");
    const myResult = payload.playerResults?.find(
      (player) => player.userId === myUserId
    );

    if (myResult?.answer) {
      chosenIndex = ["a", "b", "c", "d"].indexOf(myResult.answer);
    }

    if (correctIndex !== -1) {
      ui.showAnswerFeedback(correctIndex, chosenIndex);
    }

    const everyoneAnswered =
      Array.isArray(payload.playerResults) && payload.playerResults.length > 0;

    const allCorrect =
      everyoneAnswered &&
      payload.playerResults.every(
        (player) => player.answer === payload.correctOption
      );

    const allWrong =
      everyoneAnswered &&
      payload.playerResults.every(
        (player) => player.answer && player.answer !== payload.correctOption
      );

    const correctTeamMessages = [
      "We can do this!",
      "Nice work, keep going!",
      "That is more like it!",
      "We have got this!",
      "Stay sharp, team!",
    ];

    const wrongTeamMessages = [
      "Come on, focus",
      "We need to do better",
      "Stay with it!",
      "Do not lose focus",
      "Shake it off, team",
    ];

    if (allCorrect) {
      showTeamSpeech(getRandomMessage(correctTeamMessages));
    } else if (allWrong) {
      showTeamSpeech(getRandomMessage(wrongTeamMessages));
    }

    const playerDamage = state.teamHp - payload.teamHpAfter;
    const monsterDamage = state.currentMonsterHp - payload.monsterHpAfter;

    if (state.teamHp > payload.teamHpAfter) {
      state.battle.applyDamage(
        playerDamage,
        true,
        state.teamHp,
        state.teamHpMax
      );
    }

    if (state.currentMonsterHp > payload.monsterHpAfter) {
      state.battle.applyMonsterDamage(
        monsterDamage,
        false,
        state.currentMonsterHp,
        state.monsterMaxHp
      );
    }

    const monsterHpBefore = state.currentMonsterHp;
    const monsterHpAfter = payload.monsterHpAfter;
    const monsterTookDamage = monsterHpAfter < monsterHpBefore;
    const playerTookDamage = state.teamHp > payload.teamHpAfter;

    state.teamHp = payload.teamHpAfter;
    state.currentMonsterHp = monsterHpAfter;

    ui.setHud({
      player: {
        hp: payload.teamHpAfter,
        maxHp: state.teamHpMax ?? payload.teamHpAfter,
      },
      monster: {
        hp: monsterHpAfter,
        maxHp: state.monsterMaxHp ?? monsterHpAfter,
      },
    });

    if (payload.isNextStage && payload.nextMonster) {
      const nextStageNumber =
        payload.nextMonster.stage ??
        payload.nextMonster.level ??
        payload.nextStage ??
        payload.stage ??
        payload.gameState?.stage ??
        state.currentStageNumber + 1;

      state.pendingStageTransition = {
        nextMonster: payload.nextMonster,
        stageNumber: nextStageNumber,
      };
    }

    state.isPlayingHitFx = true;
    state.pendingFxCount = 0;
    state.readyDelayDone = false;

    if (state.readyDelayEvent) {
      state.readyDelayEvent.remove(false);
      state.readyDelayEvent = null;
    }

    state.readyDelayEvent = scene.time.delayedCall(900, () => {
      state.readyDelayDone = true;
      state.readyDelayEvent = null;
      maybeFinishRoundFlow();
    });

    if (monsterTookDamage) {
      state.pendingFxCount += 1;

      stopMonsterIdleFx(
        scene,
        state.groupMonsterSprite,
        state.monsterIdleTween
      );

      playMonsterHitFx(scene, state.groupMonsterSprite, monsterDamage, () => {
        state.monsterIdleTween = playMonsterIdleFx(
          scene,
          state.groupMonsterSprite
        );
        state.pendingFxCount -= 1;
        maybeFinishRoundFlow();
      });
    }

    if (playerTookDamage) {
      state.pendingFxCount += 1;

      stopPlayerIdleFx(scene, state.playerSprites, state.playerIdleTweens);

      playerFx(
        scene,
        state.playerSprites,
        state.groupMonsterSprite,
        playerDamage,
        () => {
          state.playerIdleTweens = playPlayerIdleFx(scene, state.playerSprites);
          state.pendingFxCount -= 1;
          maybeFinishRoundFlow();
        }
      );
    }

    if (!monsterTookDamage && !playerTookDamage) {
      maybeFinishRoundFlow();
    }
  }

  function onRoundStartedHandler(payload) {
    if (state.isPlayingHitFx) {
      state.pendingRoundStartedPayload = payload;
      return;
    }

    applyRoundStartedPayload(payload);
  }

  function onGameEndedHandler(payload) {
    localStorage.removeItem("eldritchRoomCode");
    localStorage.removeItem("eldritchCharacter");
    localStorage.removeItem("eldritchName");
    let message = "Game Over";

    if (payload.result === "victory" && !payload.isNextStage) {
      scene.sound.stopAll();
      scene.scene.start("Victory");
    } else if (payload.result === "defeat") {
      scene.sound.stopAll();
      scene.scene.start("GameOver");
    } else if (payload.result === "abandoned") {
      message = "Abandoned";
    }

    ui.showEndOverlay(message, () => {
      scene.scene.start("HomePage");
    });
  }

  function registerListeners() {
    onRoundResult(onRoundResultHandler);
    onRoundStarted(onRoundStartedHandler);
    onGameEnded(onGameEndedHandler);
  }

  function shutdown() {
    offRoundResult(onRoundResultHandler);
    offRoundStarted(onRoundStartedHandler);
    offGameEnded(onGameEndedHandler);

    if (state.countdownEvent) {
      state.countdownEvent.remove(false);
      state.countdownEvent = null;
    }

    if (state.readyDelayEvent) {
      state.readyDelayEvent.remove(false);
      state.readyDelayEvent = null;
    }

    if (state.levelOverlay) {
      state.levelOverlay.overlayBg.destroy();
      state.levelOverlay.overlayText.destroy();
      state.levelOverlay = null;
    }

    clearSpeechBubbles();

    stopMonsterIdleFx(scene, state.groupMonsterSprite, state.monsterIdleTween);
    stopPlayerIdleFx(scene, state.playerSprites, state.playerIdleTweens);
    state.monsterIdleTween = null;
    state.playerIdleTweens = [];

    if (state.groupMonsterSprite) {
      scene.tweens.killTweensOf(state.groupMonsterSprite);
      state.groupMonsterSprite.destroy();
      state.groupMonsterSprite = null;
    }

    state.playerSprites.forEach((sprite) => {
      scene.tweens.killTweensOf(sprite);
      sprite.destroy();
    });
    state.playerSprites = [];
  }

  return {
    start,
    handleAnswer,
    shutdown,
  };
}