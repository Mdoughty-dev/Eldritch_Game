import battleController from "../battleController";
import applyDamage from "../battleLogic";
import { playerFx } from "../playerFx";
import {
  submitAnswer,
  clientReady,
  onRoundResult,
  offRoundResult,
  onGameEnded,
  offGameEnded,
  onRoundStarted,
  offRoundStarted,
} from "../net/groupApi";

import { createPlayerSprites } from "../ui/characterLoadingUI";
import {
  playMonsterHitFx,
  playMonsterIdleFx,
  stopMonsterIdleFx,
} from "../monsterfx";
import { playPlayerIdleFx, stopPlayerIdleFx } from "../playerFx";

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
    isPlayingHitFx: false,
    battle: null,
    pendingRoundStartedPayload: null,
    pendingFxCount: 0,
    readyDelayDone: false,
    readyDelayEvent: null,
    monsterIdleTween: null,
    playerIdleTweens: [],
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

    applyRoundStartedPayload(state.roundStartedPayload);
    registerListeners();
    state.battle = battleController(
      scene,
      ui.playerHealthBar,
      ui.monsterHealthBar,
    );
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

  function applyRoundStartedPayload(payload) {
    const { monster, question, gameState } = payload;

    if (!monster || !question || !gameState) {
      console.error("Invalid roundStartedPayload:", payload);
      return;
    }

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
    state.monsterMaxHp = nextMonster.max_hp;
    state.currentMonsterHp = nextMonster.max_hp;

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

  function maybeFinishRoundFlow() {
    if (!state.readyDelayDone) return;
    if (state.pendingFxCount > 0) return;

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
      (player) => player.userId === myUserId,
    );

    if (myResult?.answer) {
      chosenIndex = ["a", "b", "c", "d"].indexOf(myResult.answer);
    }

    if (correctIndex !== -1) {
      ui.showAnswerFeedback(correctIndex, chosenIndex);
    }

    const playerDamage = state.teamHp - payload.teamHpAfter;
    const monsterDamage = state.currentMonsterHp - payload.monsterHpAfter;

    if (state.teamHp > payload.teamHpAfter) {
      state.battle.applyDamage(
        playerDamage,
        true,
        state.teamHp,
        state.teamHpMax,
      );
    }
    if (state.currentMonsterHp > payload.monsterHpAfter) {
      state.battle.applyMonsterDamage(
        monsterDamage,
        false,
        state.currentMonsterHp,
        state.monsterMaxHp,
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
      state.battle.resetMonsterHp();
      swapMonster(payload.nextMonster);
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
        state.monsterIdleTween,
      );

      playMonsterHitFx(scene, state.groupMonsterSprite, monsterDamage, () => {
        state.monsterIdleTween = playMonsterIdleFx(
          scene,
          state.groupMonsterSprite,
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
        },
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
      scene.scene.start("Victory");
    } else if (payload.result === "defeat") {
      scene.scene.start("GameOver");
    } else if (payload.result === "abandoned") message = "Abandoned";

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
