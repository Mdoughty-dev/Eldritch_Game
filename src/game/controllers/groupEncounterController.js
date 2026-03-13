import battleController from "../battleController";
import applyDamage from "../battleLogic";
import {
	submitAnswer,
	onRoundResult,
	offRoundResult,
	onGameEnded,
	offGameEnded,
	onRoundStarted,
	offRoundStarted,
} from '../net/groupApi';

export function createGroupEncounterController(scene, ui, sceneData) {
  const state = {
    roomCode: sceneData.roomCode ?? null,
    roundStartedPayload: sceneData.roundStartedPayload ?? null,
    countdownEvent: null,
    groupMonsterSprite: null,
    playerSprite: null,
    groupCharacter: sceneData.groupCharacter ?? null,
    currentQuestionId: null,
    roundDeadline: null,
    teamHp: null,
    teamHpMax: null,
    monsterMaxHp: null,
    currentMonsterHp: null,
    isPlayingHitFx: false,
    battle: null,
  };

  function playMonsterHitFx() {
    if (!state.groupMonsterSprite) return;

    const monster = state.groupMonsterSprite;
    const startX = monster.x;
    const startY = monster.y;
    const originalScaleX = monster.scaleX;
    const originalScaleY = monster.scaleY;

    state.isPlayingHitFx = true;

    scene.tweens.killTweensOf(monster);

    monster.clearTint();
    monster.setTint(0xff4444);
    monster.setScale(originalScaleX * 1.08, originalScaleY * 1.08);

    scene.tweens.add({
      targets: monster,
      x: startX + 18,
      duration: 45,
      yoyo: true,
      repeat: 4,
      onComplete: () => {
        monster.setPosition(startX, startY);
        monster.clearTint();
        monster.setScale(originalScaleX, originalScaleY);
        state.isPlayingHitFx = false;
      },
    });
  }

  function start() {
    if (!state.roundStartedPayload) {
      console.error("Missing roundStartedPayload for group mode");
      ui.setHud({});
      ui.setQuestion({});
      ui.setTimer("");
      return;
    }

    createPlayerSprite();
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

  function createPlayerSprite() {
    if (!state.groupCharacter?.image_name) {
      console.warn("No group character provided to EncounterScene");
      return;
    }

    if (!scene.textures.exists(state.groupCharacter.image_name)) {
      console.warn("Missing player texture:", state.groupCharacter.image_name);
      return;
    }

    if (state.playerSprite) {
      state.playerSprite.destroy();
    }

    state.playerSprite = scene.add
      .image(250, 380, state.groupCharacter.image_name)
      .setOrigin(0.5)
      .setScale(0.3);
  }

  function applyRoundStartedPayload(payload) {
    const { monster, question, gameState } = payload;

    state.currentQuestionId = question.id;
    state.roundDeadline = gameState.roundDeadline;
    state.teamHp = gameState.teamHp;
    state.teamHpMax ??= gameState.teamHp;
    state.monsterMaxHp = monster.maxHp;
    state.currentMonsterHp = monster.hp;

    if (!scene.textures.exists(monster.image_name)) {
      console.warn("Missing monster texture:", monster.image_name);
    }

    if (!state.groupMonsterSprite) {
      state.groupMonsterSprite = scene.add
        .image(980, 380, monster.image_name)
        .setOrigin(0.5)
        .setScale(0.5);
    } else {
      scene.tweens.killTweensOf(state.groupMonsterSprite);
      state.groupMonsterSprite.clearTint();
      state.groupMonsterSprite.setTexture(monster.image_name);
      state.groupMonsterSprite.setPosition(980, 380);
      state.groupMonsterSprite.setScale(0.5);
    }

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
    state.currentMonsterHp = nextMonster.max_hp;if (remaining <= 0) {
			scene.time.addEvent({
				delay: 1000,
				callback: () =>
					scene.scene.start(isPlayer ? 'GameOver' : 'VictoryPage'),
			});
		}

    if (!scene.textures.exists(nextMonster.image_name)) {
      console.warn("Missing next monster texture:", nextMonster.image_name);
    }

    if (!state.groupMonsterSprite) {
      state.groupMonsterSprite = scene.add
        .image(980, 380, nextMonster.image_name)
        .setOrigin(0.5)
        .setScale(0.5);
    } else {
      scene.tweens.killTweensOf(state.groupMonsterSprite);
      state.groupMonsterSprite.clearTint();
      state.groupMonsterSprite.setTexture(nextMonster.image_name);
      state.groupMonsterSprite.setPosition(980, 380);
      state.groupMonsterSprite.setScale(0.5);
    }
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
      swapMonster(payload.nextMonster);
    }

    if (monsterTookDamage) {
      playMonsterHitFx();
    }
  }

  function onRoundStartedHandler(payload) {
    if (state.isPlayingHitFx) {
      scene.time.delayedCall(260, () => {
        applyRoundStartedPayload(payload);
      });
      return;
    }

    applyRoundStartedPayload(payload);
  }

  function onGameEndedHandler(payload) {
    let message = "Game Over";

    if (payload.result === "victory") scene.scene.start('Victory');
    else if (payload.result === "defeat") scene.scene.start('GameOver');
    else if (payload.result === "abandoned") message = "Abandoned";

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

    if (state.groupMonsterSprite) {
      scene.tweens.killTweensOf(state.groupMonsterSprite);
    }

    if (state.playerSprite) {
      scene.tweens.killTweensOf(state.playerSprite);
    }
  }

  return {
    start,
    handleAnswer,
    shutdown,
  };
}
