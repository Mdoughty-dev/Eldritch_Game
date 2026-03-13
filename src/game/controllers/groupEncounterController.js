import {
  submitAnswer,
  onRoundResult,
  offRoundResult,
  onGameEnded,
  offGameEnded,
  onRoundStarted,
  offRoundStarted,
} from "../net/groupApi";

import { characters } from "../data/characterData";
import { playMonsterHitFx } from "../monsterfx";

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
  };

  function start() {
    if (!state.roundStartedPayload) {
      console.error("Missing roundStartedPayload for group mode");
      ui.setHud({});
      ui.setQuestion({});
      ui.setTimer("");
      return;
    }

    createPlayerSprites();
    applyRoundStartedPayload(state.roundStartedPayload);
    registerListeners();
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

  //state.playerSprites = createPlayerSprites(scene, state.groupPlayers);
  function createPlayerSprites() {
    state.playerSprites.forEach((sprite) => {
      scene.tweens.killTweensOf(sprite);
      sprite.destroy();
    });
    state.playerSprites = [];

    if (!state.groupPlayers.length) {
      console.warn("No group players provided to EncounterScene");
      return;
    }

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

    const party = state.groupPlayers.slice(0, 4);
    const positions = positionsByCount[party.length] ?? positionsByCount[1];

    party.forEach((player, index) => {
      const mappedCharacter =
        characters.find(
          (c) =>
            (c.character_id ?? c.id) ===
            (player.character?.character_id ?? player.character?.id)
        ) ?? player.character;

      const imageName = mappedCharacter?.image_name;

      console.log("rendering player:", player.name, mappedCharacter);

      if (!imageName) {
        console.warn("Player missing image_name:", player);
        return;
      }

      if (!scene.textures.exists(imageName)) {
        console.warn("Missing player texture:", imageName);
        return;
      }

      const { x, y } = positions[index];

      const sprite = scene.add
        .image(x, y, imageName)
        .setOrigin(0.5)
        .setScale(0.3);

      state.playerSprites.push(sprite);
    });
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
    state.currentMonsterHp = nextMonster.max_hp;

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
      (player) => player.userId === myUserId
    );

    if (myResult?.answer) {
      chosenIndex = ["a", "b", "c", "d"].indexOf(myResult.answer);
    }

    if (correctIndex !== -1) {
      ui.showAnswerFeedback(correctIndex, chosenIndex);
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
      state.isPlayingHitFx = true;

      playMonsterHitFx(scene, state.groupMonsterSprite, () => {
        state.isPlayingHitFx = false;
      });
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

    if (payload.result === "victory") message = "Victory!";
    else if (payload.result === "defeat") message = "Defeat!";
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