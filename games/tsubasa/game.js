(() => {
  "use strict";

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const randInt = (min, max) => Math.floor(min + Math.random() * (max - min + 1));
  const DEBUG_ANCHORS = (() => {
    try {
      return new URLSearchParams(location.search).has("debugAnchors");
    } catch {
      return false;
    }
  })();

  const BODY_ANIMATIONS = {
    RUN: { row: 0, frames: 5, headOffsets: [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }] },
    SHOT: { row: 1, frames: 5, headOffsets: [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }] },
    IDLE: { row: 2, frames: 1, headOffsets: [{ x: 0, y: 0 }] },
  };

  const GAME_TEXTS = {
    MATCH_START: "¡Bienvenidos al duelo matemático! ¡Que ruede el balón!",
    ENCOUNTER: "¡El rival cierra el paso! ¡Resuelve para avanzar!",
    MATH_SUCCESS: "¡Cálculo perfecto! ¡El capitán avanza con determinación!",
    MATH_FAIL: "¡Error de cálculo! ¡Le han robado la cartera!",
    SPECIAL_SHOT: "¡ESTO ES INCREÍBLE! ¡Va a lanzar su tiro especial!",
    GOAL: "¡GOOOOOOL! ¡La ciencia y el deporte se dan la mano!",
    SAVE: "¡Paradón! ¡El portero ha leído el ángulo perfectamente!",
  };

  const FIELD_HEIGHT = 136;
  const UI_Y = FIELD_HEIGHT;
  const FIELD_W = 256;
  const FIELD_H = FIELD_HEIGHT;

  const COLLAGE_ATLAS = {
    cell: 64,
    playerFrames: 5,
    keeperFrames: 2,
  };

  class Input {
    constructor(target = window) {
      this.keysDown = new Set();
      this.keysPressed = new Set();
      this.textBuffer = "";
      this._onKeyDown = (e) => {
        const k = e.key;
        if (
          k === "ArrowUp" ||
          k === "ArrowDown" ||
          k === "ArrowLeft" ||
          k === "ArrowRight" ||
          k === " " ||
          k === "Enter" ||
          k === "Escape" ||
          k === "Backspace"
        ) {
          e.preventDefault();
          e.stopPropagation();
        }

        if (!this.keysDown.has(k)) this.keysPressed.add(k);
        this.keysDown.add(k);

        if (/^\d$/.test(k)) this.textBuffer += k;
        if (k === "Backspace") this.textBuffer = this.textBuffer.slice(0, -1);
      };
      this._onKeyUp = (e) => {
        this.keysDown.delete(e.key);
      };
      target.addEventListener("keydown", this._onKeyDown);
      target.addEventListener("keyup", this._onKeyUp);
    }

    consumePressed(key) {
      if (this.keysPressed.has(key)) {
        this.keysPressed.delete(key);
        return true;
      }
      return false;
    }

    isDown(key) {
      return this.keysDown.has(key);
    }

    frameReset() {
      this.keysPressed.clear();
    }

    consumeText() {
      const t = this.textBuffer;
      this.textBuffer = "";
      return t;
    }
  }

  class AssetLoader {
    constructor() {
      this.images = new Map();
    }

    loadImage(key, src) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          this.images.set(key, img);
          resolve(img);
        };
        img.onerror = () => reject(new Error(`No se pudo cargar: ${src}`));
        img.src = src;
      });
    }

    getImage(key) {
      const img = this.images.get(key);
      if (!img) throw new Error(`Imagen no cargada: ${key}`);
      return img;
    }
  }

  class SpriteSheet {
    constructor(image, frameW, frameH) {
      this.image = image;
      this.frameW = frameW;
      this.frameH = frameH;
      this.columns = Math.max(1, Math.floor(image.width / frameW));
    }

    drawFrame(ctx, frameIndex, dx, dy, opts = {}) {
      const prevSmooth = ctx.imageSmoothingEnabled;
      ctx.imageSmoothingEnabled = false;
      const { flipX = false } = opts;
      const sx = (frameIndex % this.columns) * this.frameW;
      const sy = Math.floor(frameIndex / this.columns) * this.frameH;

      if (!flipX) {
        ctx.drawImage(this.image, sx, sy, this.frameW, this.frameH, dx, dy, this.frameW, this.frameH);
        ctx.imageSmoothingEnabled = prevSmooth;
        return;
      }

      ctx.save();
      ctx.translate(dx + this.frameW, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(this.image, sx, sy, this.frameW, this.frameH, 0, 0, this.frameW, this.frameH);
      ctx.restore();
      ctx.imageSmoothingEnabled = prevSmooth;
    }

    drawFrameTo(ctx, frameIndex, dx, dy, dw, dh, opts = {}) {
      const prevSmooth = ctx.imageSmoothingEnabled;
      ctx.imageSmoothingEnabled = false;
      const { flipX = false } = opts;
      const sx = (frameIndex % this.columns) * this.frameW;
      const sy = Math.floor(frameIndex / this.columns) * this.frameH;

      if (!flipX) {
        ctx.drawImage(this.image, sx, sy, this.frameW, this.frameH, dx, dy, dw, dh);
        ctx.imageSmoothingEnabled = prevSmooth;
        return;
      }

      ctx.save();
      ctx.translate(dx + dw, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(this.image, sx, sy, this.frameW, this.frameH, 0, 0, dw, dh);
      ctx.restore();
      ctx.imageSmoothingEnabled = prevSmooth;
    }
  }

  class Player {
    constructor({
      x,
      y,
      bodySheet,
      headSheet,
      headIndex = 0,
      bodyFrame = 0,
      facing = 1,
      name = "Player",
      paperDoll = {},
    }) {
      this.x = x;
      this.y = y;
      this.vx = 0;
      this.vy = 0;
      this.speed = 38;

      this.name = name;
      this.facing = facing;
      this.hasBall = false;

      this.bodySheet = bodySheet;
      this.headSheet = headSheet;
      this.headIndex = headIndex;
      this.bodyFrame = bodyFrame;
      this.animTime = 0;
      this.animRate = 10;
      this.action = null;
      this.actionTime = 0;
      this.animName = "IDLE";
      this.animFrame = 0;

      this.paperDoll = {
        bodyNeckX: 32,
        bodyNeckY: 16,
        headNeckX: 12,
        headNeckY: 22,
        headOffsetX: 0,
        headOffsetY: 0,
        headFlipX: false,
        headScale: 1,
        ...paperDoll,
      };
    }

    update(dt) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.animTime += dt;

      if (this.action === "kick") {
        this.actionTime += dt;
        this.animName = "SHOT";
        if (this.actionTime < 0.10) this.animFrame = 0;
        else if (this.actionTime < 0.20) this.animFrame = 1;
        else if (this.actionTime < 0.30) this.animFrame = 2;
        else if (this.actionTime < 0.40) this.animFrame = 3;
        else if (this.actionTime < 0.55) this.animFrame = 4;
        else {
          this.action = null;
          this.actionTime = 0;
          this.animName = "IDLE";
          this.animFrame = 0;
        }
        return;
      }

      if (Math.abs(this.vx) + Math.abs(this.vy) > 0.01) {
        this.animName = "RUN";
        const anim = BODY_ANIMATIONS.RUN;
        const phase = Math.floor(this.animTime * this.animRate) % anim.frames;
        this.animFrame = phase;
      } else {
        this.animName = "IDLE";
        this.animFrame = 0;
      }
    }

    triggerKick() {
      this.action = "kick";
      this.actionTime = 0;
    }

    _poseOffsets() {
      const anim = BODY_ANIMATIONS[this.animName] || BODY_ANIMATIONS.IDLE;
      const o = anim.headOffsets[this.animFrame] || anim.headOffsets[0] || { x: this.paperDoll.headOffsetX, y: this.paperDoll.headOffsetY };
      let headOffsetY = o.y;
      if (this.animName === "RUN") headOffsetY += this.animFrame % 2 === 1 ? 1 : -1;
      return { headOffsetX: o.x, headOffsetY };
    }

    _poseAnchors() {
      const anim = BODY_ANIMATIONS[this.animName] || BODY_ANIMATIONS.IDLE;
      const a = anim.bodyAnchors && (anim.bodyAnchors[this.animFrame] || anim.bodyAnchors[0]);
      const baseBody = a || { x: this.paperDoll.bodyNeckX, y: this.paperDoll.bodyNeckY };
      const body = { x: baseBody.x, y: baseBody.y };
      if (this.animName === "RUN" && this.animFrame % 2 === 1) body.y += 1;
      return {
        body,
        head: { x: this.paperDoll.headNeckX, y: this.paperDoll.headNeckY },
      };
    }

    draw(ctx) {
      const flipX = this.facing < 0;
      const bx = Math.round(this.x);
      const by = Math.round(this.y);
      const pose = this._poseOffsets();
      const anchors = this._poseAnchors();

      const bodyW = this.bodySheet.frameW;
      const bodyAnchorX = flipX ? bodyW - anchors.body.x : anchors.body.x;
      const bodyAnchorY = anchors.body.y;

      const anim = BODY_ANIMATIONS[this.animName] || BODY_ANIMATIONS.IDLE;
      const bodyFrameIndex = anim.row * this.bodySheet.columns + this.animFrame;
      this.bodySheet.drawFrame(ctx, bodyFrameIndex, bx, by, { flipX });

      const bodyAx = Math.round(bx + bodyAnchorX);
      const bodyAy = Math.round(by + bodyAnchorY);

      if (this.headSheet) {
        const headFlipX = Boolean(this.paperDoll.headFlipX) ? !flipX : flipX;
        const headW = this.headSheet.frameW;
        const headH = this.headSheet.frameH;
        const headOffsetX = flipX ? -pose.headOffsetX : pose.headOffsetX;
        const headScale = clamp(Number(this.paperDoll.headScale ?? 1), 0.5, 1.5);
        const headScaleX = clamp(Number(this.paperDoll.headScaleX ?? headScale), 0.5, 2.0);
        const headScaleY = clamp(Number(this.paperDoll.headScaleY ?? headScale), 0.5, 2.0);
        const headAnchorX = (headFlipX ? headW - anchors.head.x : anchors.head.x) * headScaleX;
        const headAnchorY = anchors.head.y * headScaleY;
        const headDx = bx + bodyAnchorX + headOffsetX - headAnchorX;
        const headDy = by + bodyAnchorY + pose.headOffsetY - headAnchorY;
        const headDw = headW * headScaleX;
        const headDh = headH * headScaleY;
        this.headSheet.drawFrameTo(ctx, this.headIndex, headDx, headDy, headDw, headDh, { flipX: headFlipX });

        if (DEBUG_ANCHORS) {
          const headAx = Math.round(headDx + headAnchorX);
          const headAy = Math.round(headDy + headAnchorY);
          if (bodyAx === headAx && bodyAy === headAy) {
            ctx.fillStyle = "#ff00ff";
            ctx.fillRect(bodyAx, bodyAy, 1, 1);
          } else {
            ctx.fillStyle = "#ff0000";
            ctx.fillRect(bodyAx, bodyAy, 1, 1);
            ctx.fillStyle = "#00aaff";
            ctx.fillRect(headAx, headAy, 1, 1);
          }
        }
      } else if (DEBUG_ANCHORS) {
        ctx.fillStyle = "#ff0000";
        ctx.fillRect(bodyAx, bodyAy, 1, 1);
      }

      if (this.hasBall) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(bx + Math.round(bodyW / 2) + (flipX ? -6 : 6), by + this.bodySheet.frameH - 12, 2, 2);
      }
    }

    drawAt(ctx, x, y) {
      const prevX = this.x;
      const prevY = this.y;
      this.x = x;
      this.y = y;
      this.draw(ctx);
      this.x = prevX;
      this.y = prevY;
    }
  }

  class Menu {
    constructor(options) {
      this.options = options;
      this.index = 0;
      this.enabled = true;
    }

    move(delta) {
      if (!this.enabled) return;
      this.index = (this.index + delta + this.options.length) % this.options.length;
    }

    current() {
      return this.options[this.index];
    }
  }

  class MathChallenge {
    static _shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = randInt(0, i);
        const t = arr[i];
        arr[i] = arr[j];
        arr[j] = t;
      }
      return arr;
    }

    static generate(difficulty) {
      const d = clamp(Math.floor(difficulty), 1, 3);

      if (d === 1) {
        const a = randInt(1, 10);
        const b = randInt(1, 10);
        const answer = a + b;
        const choices = [answer, answer + randInt(1, 4), Math.max(0, answer - randInt(1, 4))];
        MathChallenge._shuffle(choices);
        return { question: `${a} + ${b} = ?`, answer, choices, timeout: 10000 / d };
      }

      if (d === 2) {
        const a = randInt(2, 12);
        const b = randInt(2, 12);
        const answer = a * b;
        const choices = [answer, answer + randInt(1, 6), Math.max(0, answer - randInt(1, 6))];
        MathChallenge._shuffle(choices);
        return { question: `${a} × ${b} = ?`, answer, choices, timeout: 10000 / d };
      }

      const a = randInt(1, 20);
      const x = randInt(0, 20);
      const b = x + a;
      const answer = x;
      const choices = [answer, answer + randInt(1, 3), Math.max(0, answer - randInt(1, 3))];
      MathChallenge._shuffle(choices);
      return { question: `x + ${a} = ${b}. x = ?`, answer, choices, timeout: 10000 / d };
    }

    constructor(difficulty) {
      const { question, answer, choices, timeout } = MathChallenge.generate(difficulty);
      this.difficulty = clamp(Math.floor(difficulty), 1, 3);
      this.question = question;
      this.answer = answer;
      this.choices = Array.isArray(choices) && choices.length ? choices : [answer];
      this.choiceIndex = 0;
      this.timeoutMs = timeout;
      this.startedAt = performance.now();
      this.expiresAt = performance.now() + this.timeoutMs;
      this.done = false;
      this.correct = false;
    }

    prompt() {
      return this.question;
    }

    moveChoice(delta) {
      if (this.done) return;
      this.choiceIndex = (this.choiceIndex + delta + this.choices.length) % this.choices.length;
    }

    selected() {
      return this.choices[this.choiceIndex];
    }

    submitChoice() {
      if (this.done) return;
      const n = this.selected();
      this.correct = n === this.answer;
      this.done = true;
      return this.correct;
    }
  }

  class Commentator {
    constructor({ sheet, maxFrames = 4 }) {
      this.sheet = sheet;
      this.maxFrames = maxFrames;
      this.state = "IDLE";
      this.t = 0;
      this.frame = 0;
      this.idleFrame = 0;
      this.talkFrames = [1, 2];
      this.rate = 10;
      this.idleTime = 0;
      this.glintFrame = 3;
      this.glintEvery = 5;
      this.glintTime = 0;
      this.glintDuration = 0.18;
    }

    setTalking(isTalking) {
      this.state = isTalking ? "TALKING" : "IDLE";
    }

    update(dt) {
      if (this.state === "TALKING") {
        this.t += dt;
        const idx = Math.floor(this.t * this.rate) % this.talkFrames.length;
        this.frame = this.talkFrames[idx];
        this.idleTime = 0;
        this.glintTime = 0;
        return;
      }

      this.t = 0;
      this.idleTime += dt;

      if (this.glintFrame < this.maxFrames) {
        if (this.glintTime > 0) {
          this.glintTime = Math.max(0, this.glintTime - dt);
          this.frame = this.glintFrame;
          return;
        }

        if (this.idleTime >= this.glintEvery) {
          this.idleTime = 0;
          if (Math.random() < 0.55) this.glintTime = this.glintDuration;
        }
      }

      this.frame = this.idleFrame;
    }

    draw(ctx, x, y, size = 52) {
      const sx = (this.frame % this.sheet.columns) * this.sheet.frameW;
      const sy = Math.floor(this.frame / this.sheet.columns) * this.sheet.frameH;
      ctx.drawImage(this.sheet.image, sx, sy, this.sheet.frameW, this.sheet.frameH, x, y, size, size);
    }
  }

  class Game {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.ctx.imageSmoothingEnabled = false;

      this.input = new Input();
      this.assets = new AssetLoader();

      this.time = 0;
      this.lastTs = 0;

      this.state = "BOOT";
      this.menu = new Menu(["Regate", "Pase", "Tiro"]);
      this.challenge = null;
      this.dialog = {
        full: "",
        shown: "",
        typing: false,
        cps: 42,
        acc: 0,
        autoClearAfter: 0,
        autoClearT: 0,
      };
      this.messageTimer = 0;

      this.player = null;
      this.rival = null;
      this.scenePlayer = null;
      this.sceneRival = null;
      this.commentator = null;
      this.uiSheet = null;
      this.npcs = [];

      this.fx = {
        shakeTime: 0,
        shakeStrength: 0,
        slowMoTime: 0,
      };

      this.shot = null;
      this.pass = null;
      this.netBreak = null;
      this.netBreakImage = null;
      this.netBreakSheet = null;
      this.goalScene = null;

      this.lines = {
        encounter: [
          "¡Se encuentran en el medio campo! ¡Es un duelo de cerebros!",
          "¡El defensa cierra el paso! ¡Rápido, calcula la trayectoria!",
          "¡Atención! ¡Si resuelve esta operación, dejará atrás a la defensa!",
        ],
        success: [
          "¡Magnífico! ¡Ha leído el juego perfectamente!",
        ],
        successFast: [
          "¡Increíble! ¡Su mente es más rápida que el propio balón!",
        ],
        successSpecialShot: [
          "¡¿Pero qué es esto?! ¡Una energía asombrosa emana del jugador! ¡TIRO DEL TIGRE!",
        ],
        fail: [
          "¡Oh, no! ¡Se ha bloqueado en el último segundo!",
          "¡Cálculo erróneo! ¡El rival aprovecha el titubeo y roba el balón!",
          "¡La presión ha sido demasiada! ¡Necesita recuperar la concentración!",
        ],
        keeperSave: [
          "¡Es una muralla! ¡Ha calculado el ángulo de disparo a la perfección!",
        ],
        keeperGoal: [
          "¡El balón perfora la red! ¡Era un disparo matemáticamente imparable!",
        ],
      };

      this.sfx = {
        beep: null,
        lastBeepAt: 0,
      };

      this.score = { player: 0, rival: 0 };
      this.possession = "player";

      this.music = {
        unlocked: false,
        currentGroup: null,
        currentKey: null,
        tracks: {
          animo1: null,
          animo2: null,
          presion1: null,
          presion2: null,
        },
      };

      const unlock = () => {
        if (this.music.unlocked) return;
        this.music.unlocked = true;
        this._updateMusic(true);
      };
      window.addEventListener("pointerdown", unlock, { once: true });
      window.addEventListener("keydown", unlock, { once: true });
    }

    async boot() {
      this.state = "LOADING";

      const v = Date.now();
      const playersSrc = `./assets/nuevo3.png?v=${v}`;
      const netBreakSrc = `./assets/net_break.png?v=${v}`;
      const uiSrc = `./assets/ui_elements.png?v=${v}`;

      await Promise.all([
        this.assets.loadImage("players", playersSrc).catch(() => null),
        this.assets.loadImage("netBreak", netBreakSrc).catch(() => null),
        this.assets.loadImage("ui", uiSrc).catch(() => null),
      ]);

      const playersImg = this.assets.images.get("players");
      this.netBreakImage = this.assets.images.get("netBreak") || null;
      this.netBreakSheet = this.netBreakImage ? new SpriteSheet(this.netBreakImage, 48, 48) : null;
      const uiImg = this.assets.images.get("ui") || null;

      let sheets = { white: null, blue: null, keeperWhite: null, keeperBlue: null };
      let sheetWarning = null;
      try {
        sheets = this._makeBodySheetsFromUnified(playersImg);
      } catch (e) {
        sheetWarning = e && e.message ? e.message : String(e);
      }
      const bodySheet = sheets.white || this._makeFallbackBodySheet();
      this.uiSheet = uiImg ? new SpriteSheet(uiImg, 64, 64) : this._makeFallbackUiSheet();
      this.commentator = new Commentator({ sheet: this.uiSheet });
      this._initAudio();

      this.player = new Player({
        x: 52,
        y: 72,
        bodySheet,
        name: "Tú",
      });

      this.rival = new Player({
        x: 140,
        y: 72,
        bodySheet: sheets.blue || this.player.bodySheet,
        name: "Rival",
        facing: -1,
      });
      this._setPossession("player");

      this.scenePlayer = new Player({
        x: 0,
        y: 0,
        bodySheet: this.player.bodySheet,
        name: "Tú",
      });
      this.sceneRival = new Player({
        x: 0,
        y: 0,
        bodySheet: this.rival.bodySheet,
        name: "Rival",
        facing: -1,
      });

      this._initNpcDots();

      this.state = "FIELD";
      if (sheetWarning) this._setDialog(sheetWarning, { typewriter: true });
      else this._setDialog(GAME_TEXTS.MATCH_START, { typewriter: true, autoClearAfter: 1.0 });
    }

    _initNpcDots() {
      const dots = [];
      const mk = (team, xMin, xMax, color, opts = {}) => {
        const x = randInt(xMin, xMax);
        const y = randInt(10, FIELD_H - 20);
        const vx = randInt(-18, 18);
        const vy = randInt(-12, 12);
        const hx = x;
        const hy = y;
        const maxVx = opts.maxVx ?? 28;
        const maxVy = opts.maxVy ?? 20;
        return { team, x, y, vx, vy, hx, hy, maxVx, maxVy, color, t: Math.random() * 10 };
      };
      const perTeam = 11;
      for (let i = 0; i < perTeam - 1; i++) dots.push(mk("A", 18, 118, "#7fd0ff"));
      for (let i = 0; i < perTeam - 1; i++) dots.push(mk("B", 138, 238, "#ff6b6b"));
      dots.push(mk("A", 10, 26, "#7fd0ff", { maxVx: 14, maxVy: 10 }));
      dots.push(mk("B", 230, 246, "#ff6b6b", { maxVx: 14, maxVy: 10 }));
      this.npcs = dots;
    }

    _updateNpcDots(dt) {
      for (const d of this.npcs) {
        d.t += dt;
        if (d.t > 1.1) {
          d.t = 0;
          d.vx += randInt(-8, 8);
          d.vy += randInt(-6, 6);
          d.vx = clamp(d.vx, -d.maxVx, d.maxVx);
          d.vy = clamp(d.vy, -d.maxVy, d.maxVy);
        }
        d.vx += (d.hx - d.x) * 0.65 * dt;
        d.vy += (d.hy - d.y) * 0.65 * dt;
        d.vx = clamp(d.vx, -d.maxVx, d.maxVx);
        d.vy = clamp(d.vy, -d.maxVy, d.maxVy);
        d.x += d.vx * dt;
        d.y += d.vy * dt;

        const xMin = 14;
        const xMax = FIELD_W - 14;
        const yMin = 10;
        const yMax = FIELD_H - 10;
        if (d.x < xMin) {
          d.x = xMin;
          d.vx = Math.abs(d.vx);
        }
        if (d.x > xMax) {
          d.x = xMax;
          d.vx = -Math.abs(d.vx);
        }
        if (d.y < yMin) {
          d.y = yMin;
          d.vy = Math.abs(d.vy);
        }
        if (d.y > yMax) {
          d.y = yMax;
          d.vy = -Math.abs(d.vy);
        }
      }
    }

    start() {
      requestAnimationFrame((ts) => this._tick(ts));
    }

    _tick(ts) {
      if (!this.lastTs) this.lastTs = ts;
      const dtReal = Math.min(0.05, (ts - this.lastTs) / 1000);
      this.lastTs = ts;
      this.time += dtReal;

      this._updateFx(dtReal);
      this._updateDialog(dtReal);
      if (this.commentator) this.commentator.update(dtReal);
      const dt = this.fx.slowMoTime > 0 ? dtReal * 0.35 : dtReal;

      this.update(dt);
      this.render();
      this.input.frameReset();

      requestAnimationFrame((t) => this._tick(t));
    }

    update(dt) {
      if (this.state === "LOADING") return;

      this._updateProjectile(dt);
      this._updateNpcDots(dt);
      this._updateMusic();
      if (this.player && this.rival && this.state !== "FIELD") {
        this.player.vx = 0;
        this.player.vy = 0;
        this.rival.vx = 0;
        this.rival.vy = 0;
        this.player.update(dt);
        this.rival.update(dt);
      }

      if (this.state === "FIELD") this._updateField(dt);
      if (this.state === "MENU") this._updateMenu(dt);
      if (this.state === "MATH") this._updateMath(dt);
      if (this.state === "RESOLVE") this._updateResolve(dt);
      if (this.state === "GOAL_SCENE") this._updateGoalScene(dt);
    }

    _updateField(dt) {
      const p = this.player;
      if (!this.dialog.typing && this.dialog.shown) {
        const dismiss = this.input.consumePressed("Enter") || this.input.consumePressed(" ");
        if (dismiss) this._clearDialog();
      }
      const ax = (this.input.isDown("ArrowRight") ? 1 : 0) - (this.input.isDown("ArrowLeft") ? 1 : 0);
      const ay = (this.input.isDown("ArrowDown") ? 1 : 0) - (this.input.isDown("ArrowUp") ? 1 : 0);

      p.vx = ax * p.speed;
      p.vy = ay * p.speed;
      if (ax !== 0) p.facing = ax;

      p.update(dt);
      const bw = p.bodySheet.frameW;
      const bh = p.bodySheet.frameH;
      p.x = clamp(p.x, 8, 256 - 8 - bw);
      p.y = clamp(p.y, 8, FIELD_HEIGHT - 8 - bh);

      const r = this.rival;
      const sector = p.x + bw / 2 < 86 ? 1 : (p.x + bw / 2 < 170 ? 2 : 3);
      const rs = 22;
      r.vx = 0;
      r.vy = 0;
      if (sector === 2) {
        r.vy = Math.sign(p.y - r.y) * rs;
      } else if (sector === 3) {
        r.vx = Math.sign(p.x - r.x) * rs;
        r.vy = Math.sign(p.y - r.y) * rs;
      }
      if (r.vx !== 0) r.facing = r.vx < 0 ? -1 : 1;
      r.update(dt);
      r.x = clamp(r.x, 8, 256 - 8 - r.bodySheet.frameW);
      r.y = clamp(r.y, 8, FIELD_HEIGHT - 8 - r.bodySheet.frameH);
      const dx = (p.x + bw / 2) - (r.x + r.bodySheet.frameW / 2);
      const dy = (p.y + bh / 2) - (r.y + r.bodySheet.frameH / 2);
      const dist2 = dx * dx + dy * dy;
      if (dist2 < 15 * 15) {
        p.vx = 0;
        p.vy = 0;
        const side = p.x + bw / 2 <= r.x + r.bodySheet.frameW / 2 ? 1 : -1;
        p.facing = side;
        r.facing = -side;
        this.state = "MENU";
        this.menu.enabled = true;
        this._setDialog(this._pick(this.lines.encounter), { typewriter: true });
        this.messageTimer = 0;
      }
    }

    _updateMenu() {
      if (this.input.consumePressed("ArrowUp")) this.menu.move(-1);
      if (this.input.consumePressed("ArrowDown")) this.menu.move(1);
      if (this.input.consumePressed("Escape")) {
        this.state = "FIELD";
        this._clearDialog();
        return;
      }

      const confirm = this.input.consumePressed("Enter") || this.input.consumePressed(" ");
      if (!confirm) return;

      this.challenge = new MathChallenge(this._difficultyFromFieldPosition());
      this.state = "MATH";
      this._setDialog(`${this.menu.current().toUpperCase()}: ${this.challenge.prompt()}`, { typewriter: true });
    }

    _updateMath() {
      if (!this.challenge) return;

      if (performance.now() > this.challenge.expiresAt) {
        this.challenge.done = true;
        this.challenge.correct = false;
        this.score.rival += 1;
        this._setPossession("rival");
        const action = this.menu.current();
        const successChance = 0.1;
        const success = Math.random() < successChance;
        const line1 = this._pick(this.lines.fail);
        const line2 = success ? `${action}: ¡ÉXITO!` : `${action}: FALLA`;
        this._setDialog(`${line1}\n${line2}`, { typewriter: true });
        this.messageTimer = 1.2;
        this.state = "RESOLVE";
        return;
      }

      if (this.input.consumePressed("ArrowUp")) this.challenge.moveChoice(-1);
      if (this.input.consumePressed("ArrowDown")) this.challenge.moveChoice(1);

      if (this.input.consumePressed("Escape")) {
        this.state = "MENU";
        this.challenge = null;
        this._setDialog("ELIGE ACCIÓN", { typewriter: true });
        return;
      }

      const submit = this.input.consumePressed("Enter") || this.input.consumePressed(" ");
      if (!submit) return;

      const now = performance.now();
      const elapsed = now - this.challenge.startedAt;
      const isFast = elapsed < this.challenge.timeoutMs * 0.35;

      const ok = this.challenge.submitChoice();
      const action = this.menu.current();
      const isSpecialShot = action === "Tiro" && ok && this.challenge.difficulty === 3;
      const actionLabel = isSpecialShot ? "Tiro Especial" : action;

      const nearGoal = this.player.x + this.player.bodySheet.frameW / 2 > 200;
      const successChance = ok ? (isFast ? 0.95 : 0.7) : 0.1;
      const success = Math.random() < successChance;

      if (action === "Tiro" && nearGoal) {
        const goalieDefense = 105;
        const mathScore = ok ? (isFast ? 70 : 50) + this.challenge.difficulty * 10 : 10;
        const shotPower = isSpecialShot ? 70 : 45;
        const isGoal = ok && mathScore + shotPower > goalieDefense;

        if (isSpecialShot) this._triggerSpecialShotFx();
        this.player.triggerKick();
        this._spawnShot({ special: isSpecialShot, netBreak: Boolean(isGoal && isSpecialShot) });
        this._startGoalScene({ goal: isGoal, netBreak: Boolean(isGoal && isSpecialShot) });

        if (isGoal) this.score.player += 2;
        else this.score.rival += 1;
        this._setPossession("rival");
        const text = isGoal ? (isSpecialShot ? `${GAME_TEXTS.SPECIAL_SHOT}\n${GAME_TEXTS.GOAL}` : GAME_TEXTS.GOAL) : GAME_TEXTS.SAVE;
        this._setDialog(text, { typewriter: true });
        this.state = "GOAL_SCENE";
        this.challenge = null;
        return;
      }

      const line1 = ok
        ? (isSpecialShot ? this._pick(this.lines.successSpecialShot) : (isFast ? this._pick(this.lines.successFast) : this._pick(this.lines.success)))
        : this._pick(this.lines.fail);
      const line2 = success ? `${actionLabel}: ¡ÉXITO!` : `${actionLabel}: FALLA`;
      this._setDialog(`${line1}\n${line2}`, { typewriter: true });
      this.messageTimer = 1.2;
      if (action === "Tiro" && success) {
        this.player.triggerKick();
        this._spawnShot({ special: isSpecialShot, netBreak: false });
      }
      if (action === "Pase" && success) this._spawnPass();
      if (isSpecialShot) this._triggerSpecialShotFx();
      if (success) this.score.player += 1;
      else this.score.rival += 1;
      this._setPossession(success ? "player" : "rival");
      this.state = "RESOLVE";
    }

    _difficultyFromFieldPosition() {
      const p = this.player;
      const x = p.x + p.bodySheet.frameW / 2;
      if (x < 96) return 1;
      if (x < 176) return 2;
      return 3;
    }

    _updateResolve(dt) {
      this.messageTimer -= dt;
      if (this.messageTimer > 0) return;

      const p = this.player;
      p.x = 52;
      p.y = 72;
      this.rival.x = 140;
      this.rival.y = 72;
      this.challenge = null;
      this._clearDialog();
      this.shot = null;
      this.pass = null;
      this.netBreak = null;
      this.state = "FIELD";
    }

    render() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, 256, 240);

      ctx.save();
      if (this.fx.shakeTime > 0) {
        const a = Math.max(0, Math.round(this.fx.shakeStrength * (this.fx.shakeTime / 0.35)));
        const dx = randInt(-a, a);
        const dy = randInt(-a, a);
        ctx.translate(dx, dy);
      }
      ctx.fillStyle = "#091425";
      ctx.fillRect(0, 0, 256, 240);
      this._drawUi(ctx);
      ctx.restore();
    }

    _drawMiniMap(ctx, rect) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(rect.x, rect.y, rect.w, rect.h);
      ctx.clip();

      ctx.fillStyle = "#0d6b2b";
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);

      const inner = { x: rect.x + 6, y: rect.y + 6, w: rect.w - 12, h: rect.h - 12 };

      ctx.strokeStyle = "rgba(255,255,255,0.32)";
      ctx.lineWidth = 1;
      ctx.strokeRect(inner.x, inner.y, inner.w, inner.h);
      ctx.beginPath();
      ctx.moveTo(inner.x + Math.floor(inner.w / 2) + 0.5, inner.y);
      ctx.lineTo(inner.x + Math.floor(inner.w / 2) + 0.5, inner.y + inner.h);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(inner.x + inner.w / 2, inner.y + inner.h / 2, 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeRect(inner.x, inner.y + inner.h / 2 - 12, 10, 24);
      ctx.strokeRect(inner.x + inner.w - 10, inner.y + inner.h / 2 - 12, 10, 24);

      const p = this.player;
      const r = this.rival;

      const bw = p.bodySheet.frameW;
      const bh = p.bodySheet.frameH;
      const rw = r.bodySheet.frameW;
      const rh = r.bodySheet.frameH;

      const px = (p.x + bw / 2) / FIELD_W;
      const py = (p.y + bh / 2) / FIELD_H;
      const rx = (r.x + rw / 2) / FIELD_W;
      const ry = (r.y + rh / 2) / FIELD_H;

      const dot = (nx, ny, color, size = 1) => {
        const x = inner.x + nx * inner.w;
        const y = inner.y + ny * inner.h;
        ctx.fillStyle = color;
        ctx.fillRect(Math.round(x), Math.round(y), size, size);
      };

      dot(px, py, "#fff", 2);
      dot(rx, ry, "#111", 2);
      for (const d of this.npcs) {
        dot(d.x / FIELD_W, d.y / FIELD_H, d.color);
      }
      const ball = (() => {
        if (this.pass) {
          const t = clamp(this.pass.t, 0, 1);
          return { x: this.pass.x0 + (this.pass.x1 - this.pass.x0) * t, y: this.pass.y0 + (this.pass.y1 - this.pass.y0) * t };
        }
        if (this.shot) {
          const t = clamp(this.shot.t, 0, 1);
          return { x: this.shot.x0 + (this.shot.x1 - this.shot.x0) * t, y: this.shot.y0 + (this.shot.y1 - this.shot.y0) * t };
        }
        const holder = this.possession === "rival" ? r : p;
        const hw = holder.bodySheet.frameW;
        const hh = holder.bodySheet.frameH;
        return { x: holder.x + hw / 2, y: holder.y + hh / 2 };
      })();
      dot(ball.x / FIELD_W, ball.y / FIELD_H, "#ffe66d", 2);

      ctx.restore();
    }

    _drawUi(ctx) {
      if (this.state === "FIELD") {
        const animLeft = { x: 8, y: 8, w: 120, h: 88 };
        const animRight = { x: 132, y: 8, w: 116, h: 88 };
        this._drawBlueFrame(ctx, animLeft.x, animLeft.y, animLeft.w, animLeft.h);
        this._drawBlueFrame(ctx, animRight.x, animRight.y, animRight.w, animRight.h);
        this._drawActionPreview(ctx, animLeft, animRight);
      } else {
        const big = { x: 8, y: 8, w: 240, h: 116 };
        this._drawBlueFrame(ctx, big.x, big.y, big.w, big.h);
        this._drawActionScene(ctx, big);
      }

      const dialogBox = { x: 8, y: UI_Y, w: 240, h: 48, padX: 6, padY: 6 };
      const menuBox = { x: 8, y: UI_Y + 52, w: 168, h: 52, padX: 6, padY: 6 };
      const commentatorBox = { x: 176, y: UI_Y + 52, w: 72, h: 52 };

      this._drawSpeechBubble(ctx, dialogBox.x, dialogBox.y, dialogBox.w, dialogBox.h);
      this._drawSpeechBubble(ctx, menuBox.x, menuBox.y, menuBox.w, menuBox.h);
      this._drawSpeechBubble(ctx, commentatorBox.x, commentatorBox.y, commentatorBox.w, commentatorBox.h);

      const baseText = this.state === "FIELD" ? "Muévete hacia el rival" : "";
      this._drawText(ctx, dialogBox.x + dialogBox.padX, dialogBox.y + dialogBox.padY, this.dialog.shown || baseText, "#fff", {
        maxWidth: dialogBox.w - dialogBox.padX * 2,
        maxLines: 3,
      });

      if (this.state === "MENU") this._drawMenu(ctx, menuBox);
      if (this.state === "MATH") this._drawMath(ctx, menuBox);
      if (this.commentator) this.commentator.draw(ctx, commentatorBox.x + 12, commentatorBox.y + 2, 48);
      if (DEBUG_ANCHORS && this.player && this.player.headSheet && this.player.headSheet.image) {
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(this.player.headSheet.image, 8, 96, 288 * 2, 24 * 2);
        ctx.restore();
      }
    }

    _drawActionScene(ctx, rect) {
      const inner = { x: rect.x + 6, y: rect.y + 6, w: rect.w - 12, h: rect.h - 12 };
      const mode = this.state === "MENU" || this.state === "MATH";
      const action = this.menu?.current?.() || "Regate";
      const sp = this.scenePlayer || this.player;
      const sr = this.sceneRival || this.rival;
      const nearGoal = Boolean(this.player && this.player.x + this.player.bodySheet.frameW / 2 > 200);

      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = "#091425";
      ctx.fillRect(inner.x, inner.y, inner.w, inner.h);
      ctx.restore();

      if (nearGoal) {
        const gx = inner.x + inner.w - 92;
        const gy = inner.y + 28;
        const gw = 80;
        const gh = 52;
        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.55)";
        ctx.lineWidth = 1;
        ctx.strokeRect(gx, gy, gw, gh);
        for (let i = 0; i <= 6; i++) {
          const t = i / 6;
          ctx.beginPath();
          ctx.moveTo(gx, gy + t * gh);
          ctx.lineTo(gx + gw, gy + t * gh);
          ctx.stroke();
        }
        for (let i = 0; i <= 8; i++) {
          const t = i / 8;
          ctx.beginPath();
          ctx.moveTo(gx + t * gw, gy);
          ctx.lineTo(gx + t * gw, gy + gh);
          ctx.stroke();
        }
        ctx.restore();
      }

      const drawScaled = (pl, x, y, scale, opts = {}) => {
        const prevName = pl.animName;
        const prevFrame = pl.animFrame;
        const prevFacing = pl.facing;
        if (opts.facing != null) pl.facing = opts.facing;

        pl.animName = "IDLE";
        pl.animFrame = 0;

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        pl.drawAt(ctx, 0, 0);
        ctx.restore();

        pl.animName = prevName;
        pl.animFrame = prevFrame;
        pl.facing = prevFacing;
      };

      const scale = 1.1;
      const px = inner.x + 66;
      const py = inner.y + 56;
      const rx = inner.x + inner.w - 66;
      const ry = inner.y + 56;

      drawScaled(sp, px, py, scale, { facing: 1 });
      drawScaled(sr, rx, ry, scale, { facing: -1 });

      if (this.pass) {
        const p = clamp(this.pass.t, 0, 1);
        const x = px + 32 + p * (rx - px - 64);
        const y = py + 34 - Math.sin(p * Math.PI) * 10;
        ctx.save();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return;
      }

      if (this.shot) {
        const p = clamp(this.shot.t, 0, 1);
        const x = px + 32 + p * (inner.w - 72);
        const y = py + 30 - p * 18;
        const phase = Math.sin(p * Math.PI);
        const stretch = 1 + phase * (this.shot.special ? 0.9 : 0.45);
        const squash = 1 / stretch;
        const size = this.shot.special ? 4 : 3;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(stretch, squash);
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return;
      }

      if (mode && action === "Pase") {
        const p = (Math.sin(this.time * 2.4) + 1) / 2;
        const x0 = px + 30;
        const y0 = py + 32;
        const x1 = rx - 30;
        const y1 = ry + 32;
        const x = x0 + (x1 - x0) * p;
        const y = y0 + (y1 - y0) * p - Math.sin(p * Math.PI) * 10;
        ctx.save();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return;
      }

      if (mode && action === "Tiro") {
        const p = (this.time * 0.9) % 1;
        const x = px + 30 + p * (inner.w - 80);
        const y = py + 30 - Math.sin(p * Math.PI) * 18;
        ctx.save();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return;
      }

      const x = inner.x + inner.w / 2 + Math.sin(this.time * 5) * 1.2;
      const y = inner.y + inner.h / 2 + Math.cos(this.time * 6) * 1.2;
      ctx.save();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    _drawMenu(ctx, menuBox) {
      const x = menuBox.x + menuBox.padX;
      const y = menuBox.y + menuBox.padY + 10;
      this._drawText(ctx, x, y - 10, "COMANDOS");

      for (let i = 0; i < this.menu.options.length; i++) {
        const isSel = i === this.menu.index;
        const line = `${isSel ? ">" : " "} ${this.menu.options[i]}`;
        this._drawText(ctx, x, y + i * 12, line, isSel ? "#fff" : "rgba(255,255,255,0.8)");
      }
    }

    _drawMath(ctx, menuBox) {
      if (!this.challenge) return;

      const x = menuBox.x + menuBox.padX;
      const y = menuBox.y + menuBox.padY + 10;
      const left = Math.max(0, this.challenge.expiresAt - performance.now());
      const secs = Math.ceil(left / 1000);
      this._drawText(ctx, x, y - 10, `ACCIÓN (${secs}s)`);
      const colW = Math.floor((menuBox.w - menuBox.padX * 2) / 2);
      const ax = x;
      const bx = x + colW;
      for (let i = 0; i < this.menu.options.length; i++) {
        const isSel = i === this.menu.index;
        const line = `${isSel ? ">" : " "} ${this.menu.options[i]}`;
        this._drawText(ctx, ax, y + i * 12, line, isSel ? "#fff" : "rgba(255,255,255,0.8)", { maxWidth: colW - 6, maxLines: 1 });
      }
      this._drawText(ctx, bx, y, "RESP:", "#fff", { maxWidth: colW - 6, maxLines: 1 });
      for (let i = 0; i < this.challenge.choices.length; i++) {
        const isSel = i === this.challenge.choiceIndex;
        const line = `${isSel ? ">" : " "} ${this.challenge.choices[i]}`;
        this._drawText(ctx, bx, y + 12 + i * 12, line, isSel ? "#fff" : "rgba(255,255,255,0.8)", { maxWidth: colW - 6, maxLines: 1 });
      }
    }

    _drawActionPreview(ctx, left, right) {
      const li = { x: left.x + 6, y: left.y + 6, w: left.w - 12, h: left.h - 12 };
      const ri = { x: right.x + 6, y: right.y + 6, w: right.w - 12, h: right.h - 12 };
      const px = li.x + 10;
      const py = li.y + 18;
      const rx = li.x + 62;
      const ry = li.y + 18;
      const s = 1;
      const mode = this.state === "MENU" || this.state === "MATH";
      const action = this.menu?.current?.() || "Regate";

      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = "#091425";
      ctx.fillRect(li.x, li.y, li.w, li.h);
      ctx.fillRect(ri.x, ri.y, ri.w, ri.h);
      ctx.restore();

      this._drawMiniMap(ctx, ri);

      const drawScaled = (pl, x, y) => {
        const prevName = pl.animName;
        const prevFrame = pl.animFrame;
        if (mode) {
          if (pl === this.player && action === "Tiro") {
            pl.animName = "SHOT";
            pl.animFrame = Math.floor(this.time * 8) % BODY_ANIMATIONS.SHOT.frames;
          } else if (pl.action !== "kick") {
            pl.animName = "RUN";
            pl.animFrame = Math.floor(this.time * 8) % BODY_ANIMATIONS.RUN.frames;
          }
        }
        ctx.save();
        if (mode) {
          const bob = Math.round(Math.sin(this.time * 10) * 1);
          const sway = Math.round(Math.sin(this.time * 6 + (pl === this.player ? 0 : 1.4)) * 2);
          ctx.translate(x + sway, y + bob);
        } else {
          ctx.translate(x, y);
        }
        ctx.scale(s, s);
        pl.drawAt(ctx, 0, 0);
        ctx.restore();
        pl.animName = prevName;
        pl.animFrame = prevFrame;
      };

      drawScaled(this.player, px, py);
      drawScaled(this.rival, rx, ry);

      if (!this.pass && !this.shot) {
        if (mode && action === "Pase") {
          const p = (Math.sin(this.time * 2.4) + 1) / 2;
          const x0 = px + 26;
          const y0 = py + 34;
          const x1 = rx + 18;
          const y1 = ry + 30;
          const x = x0 + (x1 - x0) * p;
          const y = y0 + (y1 - y0) * p - Math.sin(p * Math.PI) * 6;
          ctx.save();
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (mode && action === "Tiro") {
          const p = (this.time * 0.9) % 1;
          const x = px + 26 + p * 62;
          const y = py + 32 - Math.sin(p * Math.PI) * 14;
          ctx.save();
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else {
          const x = px + 26 + Math.sin(this.time * 5) * 1.5;
          const y = py + 34 + Math.cos(this.time * 6) * 1.5;
          ctx.save();
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      if (this.pass) {
        const p = clamp(this.pass.t, 0, 1);
        const x = px + 22 + p * 44;
        const y = py + 30 - p * 8;
        ctx.save();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (this.shot) {
        const p = clamp(this.shot.t, 0, 1);
        const x = px + 22 + p * 52;
        const y = py + 26 - p * 16;
        const phase = Math.sin(p * Math.PI);
        const stretch = 1 + phase * (this.shot.special ? 0.9 : 0.45);
        const squash = 1 / stretch;
        const size = this.shot.special ? 4 : 3;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(stretch, squash);
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (this.netBreak) {
        const f = this.netBreak.frames;
        const idx = f < 10 ? 0 : (f < 20 ? 1 : 2);
        const nx = li.x + Math.floor(li.w / 2) - 24;
        const ny = li.y + Math.floor(li.h / 2) - 24;
        if (this.netBreakSheet) {
          this.netBreakSheet.drawFrame(ctx, idx, nx, ny);
        } else {
          ctx.save();
          ctx.strokeStyle = "rgba(255,255,255,0.9)";
          ctx.lineWidth = 1;
          for (let i = 0; i < 6; i++) {
            const t = i / 5;
            ctx.beginPath();
            ctx.moveTo(nx + 4, ny + 4 + t * 40);
            ctx.lineTo(nx + 44, ny + 44 - t * 40);
            ctx.stroke();
          }
          ctx.restore();
        }
      }
    }

    _setDialog(text, { typewriter, autoClearAfter = 0 }) {
      const t = String(text ?? "");
      this.dialog.full = t;
      this.dialog.shown = typewriter ? "" : t;
      this.dialog.typing = Boolean(typewriter) && t.length > 0;
      this.dialog.acc = 0;
      this.dialog.autoClearAfter = autoClearAfter;
      this.dialog.autoClearT = 0;
      if (this.commentator) this.commentator.setTalking(this.dialog.typing);
    }

    _clearDialog() {
      this._setDialog("", { typewriter: false });
    }

    _updateDialog(dt) {
      if (this.dialog.typing) {
        const skip = this.input.consumePressed("Enter") || this.input.consumePressed(" ");
        if (skip) {
        this.dialog.shown = this.dialog.full;
        this.dialog.typing = false;
        if (this.commentator) this.commentator.setTalking(false);
        this.dialog.autoClearT = this.dialog.autoClearAfter;
        return;
        }
      }

      if (!this.dialog.typing) {
        if (this.dialog.autoClearT > 0) {
          this.dialog.autoClearT = Math.max(0, this.dialog.autoClearT - dt);
          if (this.dialog.autoClearT <= 0) this._clearDialog();
        }
        return;
      }
      const prevLen = this.dialog.shown.length;
      this.dialog.acc += dt * this.dialog.cps;
      const n = Math.min(this.dialog.full.length, Math.floor(this.dialog.acc));
      this.dialog.shown = this.dialog.full.slice(0, n);
      if (n > prevLen) {
        const added = this.dialog.full.slice(prevLen, n);
        this._beepForText(added);
      }
      if (n >= this.dialog.full.length) {
        this.dialog.typing = false;
        if (this.commentator) this.commentator.setTalking(false);
        this.dialog.autoClearT = this.dialog.autoClearAfter;
      }
    }

    _initAudio() {
      try {
        const a = new Audio("../../beep.mp3");
        a.volume = 0.18;
        this.sfx.beep = a;
      } catch {
        this.sfx.beep = null;
      }

      const mkMusic = (src) => {
        try {
          const a = new Audio(src);
          a.loop = true;
          a.volume = 0.06;
          return a;
        } catch {
          return null;
        }
      };
      this.music.tracks.animo1 = mkMusic("../../animo1.mp3");
      this.music.tracks.animo2 = mkMusic("../../animo2.mp3");
      this.music.tracks.presion1 = mkMusic("../../presion1.mp3");
      this.music.tracks.presion2 = mkMusic("../../presion2.mp3");
    }

    _setPossession(team) {
      this.possession = team === "rival" ? "rival" : "player";
      if (this.player) this.player.hasBall = this.possession === "player";
      if (this.rival) this.rival.hasBall = this.possession === "rival";
    }

    _desiredMusicGroup() {
      if (this.score.player < this.score.rival) return "presion";
      if (this.possession === "rival") return "presion";
      return "animo";
    }

    _updateMusic(force = false) {
      if (!this.music.unlocked) return;

      const group = this._desiredMusicGroup();
      if (!force && group === this.music.currentGroup) return;

      const cur = this.music.currentKey ? this.music.tracks[this.music.currentKey] : null;
      if (cur) {
        try {
          cur.pause();
          cur.currentTime = 0;
        } catch {}
      }

      const keys = group === "animo" ? ["animo1", "animo2"] : ["presion1", "presion2"];
      const a0 = this.music.tracks[keys[0]];
      const a1 = this.music.tracks[keys[1]];
      const pickKey = this.music.currentKey === keys[0] ? keys[1] : (this.music.currentKey === keys[1] ? keys[0] : (Math.random() < 0.5 ? keys[0] : keys[1]));
      const next = this.music.tracks[pickKey] || a0 || a1;
      if (!next) return;

      this.music.currentGroup = group;
      this.music.currentKey = next === a0 ? keys[0] : (next === a1 ? keys[1] : pickKey);
      try {
        next.currentTime = 0;
        const p = next.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      } catch {}
    }

    _beepForText(added) {
      if (!this.sfx.beep) return;
      const now = performance.now();
      if (now - this.sfx.lastBeepAt < 28) return;
      const ch = String(added).slice(-1);
      if (ch === " " || ch === "\n") return;
      this.sfx.lastBeepAt = now;
      try {
        this.sfx.beep.currentTime = 0;
        const p = this.sfx.beep.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      } catch {}
    }

    _pick(arr) {
      if (!arr || arr.length === 0) return "";
      return arr[randInt(0, arr.length - 1)];
    }

    _updateFx(dtReal) {
      this.fx.shakeTime = Math.max(0, this.fx.shakeTime - dtReal);
      this.fx.slowMoTime = Math.max(0, this.fx.slowMoTime - dtReal);
    }

    _triggerSpecialShotFx() {
      this.fx.shakeTime = 0.35;
      this.fx.shakeStrength = 3;
      this.fx.slowMoTime = 1.0;
    }

    _startGoalScene({ goal, netBreak }) {
      this.goalScene = {
        t: 0,
        duration: goal ? 1.8 : 1.4,
        goal,
        netBreak,
      };
    }

    _updateGoalScene(dt) {
      if (!this.goalScene) {
        this.state = "FIELD";
        return;
      }
      this.goalScene.t += dt;
      if (this.goalScene.t < this.goalScene.duration) return;

      const p = this.player;
      p.x = 52;
      p.y = 72;
      this.rival.x = 140;
      this.rival.y = 72;
      this.shot = null;
      this.netBreak = null;
      this.goalScene = null;
      this._clearDialog();
      this.state = "FIELD";
    }

    _spawnShot({ special, netBreak }) {
      const p = this.player;
      const startX = p.x + p.bodySheet.frameW / 2;
      const startY = p.y + p.bodySheet.frameH / 2;
      const endX = 242;
      const endY = 122;
      this.shot = {
        x0: startX,
        y0: startY,
        x1: endX,
        y1: endY,
        t: 0,
        duration: special ? 1.1 : 0.55,
        special,
        netBreak,
      };
    }

    _spawnPass() {
      const p = this.player;
      const startX = p.x + p.bodySheet.frameW / 2;
      const startY = p.y + p.bodySheet.frameH / 2;
      const dir = p.facing >= 0 ? 1 : -1;
      const endX = clamp(startX + dir * 86, 20, 236);
      const endY = clamp(startY + dir * 6, 70, 220);

      const r = this.rival;
      const rcx = r.x + r.bodySheet.frameW / 2;
      const rcy = r.y + r.bodySheet.frameH / 2;
      const dx = endX - startX;
      const dy = endY - startY;
      const len2 = dx * dx + dy * dy || 1;
      const t = clamp(((rcx - startX) * dx + (rcy - startY) * dy) / len2, 0, 1);
      const cx = startX + dx * t;
      const cy = startY + dy * t;
      const dist2 = (rcx - cx) * (rcx - cx) + (rcy - cy) * (rcy - cy);
      const interceptT = dist2 < 12 * 12 ? t : null;

      this.pass = {
        x0: startX,
        y0: startY,
        x1: endX,
        y1: endY,
        t: 0,
        duration: 0.55,
        interceptT,
      };
    }

    _updateProjectile(dt) {
      if (this.shot) {
        this.shot.t += dt / Math.max(0.0001, this.shot.duration);
        if (this.shot.t >= 1.0 && this.shot.netBreak) {
          this.netBreak = { frames: 0 };
          this.shot.netBreak = false;
        }
        if (this.shot.t >= 1.25) this.shot = null;
      }

      if (this.pass) {
        this.pass.t += dt / Math.max(0.0001, this.pass.duration);
        if (this.pass.interceptT != null && this.pass.t >= this.pass.interceptT) {
          this.pass = null;
          this._setPossession("rival");
          const p = this.player;
          const r = this.rival;
          const side = p.x + p.bodySheet.frameW / 2 <= r.x + r.bodySheet.frameW / 2 ? 1 : -1;
          p.facing = side;
          r.facing = -side;
          this.state = "MENU";
          this.menu.enabled = true;
          this._setDialog(GAME_TEXTS.ENCOUNTER, { typewriter: true });
        } else if (this.pass.t >= 1.0) {
          this.pass = null;
        }
      }

      if (this.netBreak) {
        this.netBreak.frames += dt * 60;
        if (this.netBreak.frames >= 30) this.netBreak = null;
      }
    }

    _drawShot(ctx) {
      if (!this.shot) return;
      const p = clamp(this.shot.t, 0, 1);
      const x = this.shot.x0 + (this.shot.x1 - this.shot.x0) * p;
      const y = this.shot.y0 + (this.shot.y1 - this.shot.y0) * p;

      const dx = this.shot.x1 - this.shot.x0;
      const dy = this.shot.y1 - this.shot.y0;
      const ang = Math.atan2(dy, dx);

      const phase = Math.sin(p * Math.PI);
      const stretch = 1 + phase * (this.shot.special ? 0.9 : 0.45);
      const squash = 1 / stretch;
      const size = this.shot.special ? 4 : 3;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ang);
      ctx.scale(stretch, squash);
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    _drawPass(ctx) {
      if (!this.pass) return;
      const p = clamp(this.pass.t, 0, 1);
      const x = this.pass.x0 + (this.pass.x1 - this.pass.x0) * p;
      const y = this.pass.y0 + (this.pass.y1 - this.pass.y0) * p;
      ctx.save();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    _drawNetBreak(ctx) {
      if (!this.netBreak) return;
      const x = 232;
      const y = 88;
      const w = 48;
      const h = 48;

      ctx.save();
      const f = this.netBreak.frames;
      const idx = f < 10 ? 0 : (f < 20 ? 1 : 2);
      if (this.netBreakSheet) {
        this.netBreakSheet.drawFrame(ctx, idx, x - 24, y - 12);
      } else {
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) {
          const t = i / 5;
          ctx.beginPath();
          ctx.moveTo(x, y + t * h);
          ctx.lineTo(x + w, y + (1 - t) * h);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    _drawBlueFrame(ctx, x, y, w, h) {
      ctx.fillStyle = "#0c3f73";
      ctx.fillRect(x, y, w, h);

      ctx.strokeStyle = "#7fd0ff";
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
      ctx.strokeStyle = "#061a2f";
      ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);

      ctx.fillStyle = "#091425";
      ctx.fillRect(x + 6, y + 6, w - 12, h - 12);
    }

    _drawSpeechBubble(ctx, x, y, w, h) {
      ctx.fillStyle = "#000";
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
      ctx.strokeStyle = "#7fd0ff";
      ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
    }

    _drawText(ctx, x, y, text, color = "#fff", opts = {}) {
      ctx.save();
      ctx.fillStyle = color;
      ctx.font = "8px PressStart2P, Pixelade, monospace";
      ctx.textBaseline = "top";

      const lineHeight = opts.lineHeight ?? 12;
      const maxWidth = opts.maxWidth ?? null;
      const maxLines = opts.maxLines ?? null;

      const paragraphs = String(text).split("\n");
      const out = [];

      for (const para of paragraphs) {
        if (!maxWidth) {
          out.push(para);
          continue;
        }

        const words = para.split(/\s+/).filter(Boolean);
        let line = "";
        for (const w of words) {
          const test = line ? `${line} ${w}` : w;
          if (ctx.measureText(test).width <= maxWidth) {
            line = test;
          } else {
            if (line) out.push(line);
            line = w;
          }
        }
        if (line) out.push(line);
      }

      const finalLines = maxLines ? out.slice(0, maxLines) : out;
      for (let i = 0; i < finalLines.length; i++) ctx.fillText(finalLines[i], x, y + i * lineHeight);
      ctx.restore();
    }

    _makeFallbackUiSheet() {
      const c = document.createElement("canvas");
      c.width = 64 * 3;
      c.height = 64;
      const ctx = c.getContext("2d");
      ctx.imageSmoothingEnabled = false;

      for (let i = 0; i < 3; i++) {
        const ox = i * 64;
        ctx.fillStyle = "#1f2937";
        ctx.fillRect(ox, 0, 64, 64);
        ctx.fillStyle = "#f1c27d";
        ctx.fillRect(ox + 18, 18, 28, 28);
        ctx.fillStyle = "#111";
        ctx.fillRect(ox + 14, 12, 36, 10);
        ctx.fillStyle = "#000";
        ctx.fillRect(ox + 22, 26, 6, 6);
        ctx.fillRect(ox + 36, 26, 6, 6);
        if (i === 1) ctx.fillRect(ox + 26, 40, 12, 4);
        if (i === 2) ctx.fillRect(ox + 26, 38, 12, 8);
      }

      return new SpriteSheet(c, 64, 64);
    }

    _makeBodySheetsFromUnified(playersImg) {
      const out = { white: null, blue: null, keeperWhite: null, keeperBlue: null };
      if (!playersImg) return out;

      const cell = COLLAGE_ATLAS.cell;
      const chromaTol = 5;
      const isChromaBg = (r, g, b) =>
        (Math.abs(r - 64) <= chromaTol && Math.abs(g - 64) <= chromaTol && Math.abs(b - 64) <= chromaTol) ||
        (Math.abs(r - 85) <= chromaTol && Math.abs(g - 85) <= chromaTol && Math.abs(b - 85) <= chromaTol) ||
        (Math.abs(r - 79) <= chromaTol && Math.abs(g - 84) <= chromaTol && Math.abs(b - 90) <= chromaTol) ||
        (Math.abs(r - 46) <= chromaTol && Math.abs(g - 54) <= chromaTol && Math.abs(b - 56) <= chromaTol) ||
        (Math.abs(r - 66) <= chromaTol && Math.abs(g - 73) <= chromaTol && Math.abs(b - 81) <= chromaTol) ||
        (Math.abs(r - 61) <= chromaTol && Math.abs(g - 66) <= chromaTol && Math.abs(b - 72) <= chromaTol);
      const quadW = Math.floor(playersImg.width / 2);
      const quadH = Math.floor(playersImg.height / 2);
      const quad = (q) => {
        if (q === "TR") return { x: quadW, y: 0, w: playersImg.width - quadW, h: quadH };
        if (q === "BL") return { x: 0, y: quadH, w: quadW, h: playersImg.height - quadH };
        if (q === "BR") return { x: quadW, y: quadH, w: playersImg.width - quadW, h: playersImg.height - quadH };
        return { x: 0, y: 0, w: quadW, h: quadH };
      };

      const cc = document.createElement("canvas");
      cc.width = cell;
      cc.height = cell;
      const cctx = cc.getContext("2d", { willReadFrequently: true });
      cctx.imageSmoothingEnabled = false;

      const drawSprite = (bbox, dx, dy, outCtx) => {
        const pad = 2;
        const sx = Math.max(0, bbox.x - pad);
        const sy = Math.max(0, bbox.y - pad);
        const ex = Math.min(playersImg.width, bbox.x + bbox.w + pad);
        const ey = Math.min(playersImg.height, bbox.y + bbox.h + pad);
        const sw = Math.max(1, ex - sx);
        const sh = Math.max(1, ey - sy);
        cctx.clearRect(0, 0, cell, cell);
        const scale = Math.min(cell / sw, cell / sh);
        const dw = Math.max(1, Math.round(sw * scale));
        const dh = Math.max(1, Math.round(sh * scale));
        const ox = Math.floor((cell - dw) / 2);
        const oy = Math.floor((cell - dh) / 2);
        cctx.drawImage(playersImg, sx, sy, sw, sh, ox, oy, dw, dh);
        const img = cctx.getImageData(0, 0, cell, cell);
        const d = img.data;
        for (let i = 0; i < d.length; i += 4) {
          if (d[i + 3] < 8) continue;
          if (isChromaBg(d[i], d[i + 1], d[i + 2])) d[i + 3] = 0;
        }
        cctx.putImageData(img, 0, 0);
        outCtx.drawImage(cc, dx, dy);
      };

      const extractComponents = (r) => {
        const c = document.createElement("canvas");
        c.width = Math.max(1, Math.floor(r.w));
        c.height = Math.max(1, Math.floor(r.h));
        const ctx = c.getContext("2d", { willReadFrequently: true });
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.drawImage(playersImg, r.x, r.y, r.w, r.h, 0, 0, c.width, c.height);
        const img = ctx.getImageData(0, 0, c.width, c.height);
        const d = img.data;
        const w = c.width;
        const h = c.height;
        const isBg = (i) => {
          if (d[i + 3] < 8) return true;
          return isChromaBg(d[i], d[i + 1], d[i + 2]);
        };
        const vis = new Uint8Array(w * h);
        const qx = new Int16Array(w * h);
        const qy = new Int16Array(w * h);
        const comps = [];

        for (let y0 = 0; y0 < h; y0++) {
          for (let x0 = 0; x0 < w; x0++) {
            const idx0 = y0 * w + x0;
            if (vis[idx0]) continue;
            if (isBg(idx0 * 4)) continue;
            let qh = 0;
            let qt = 0;
            qx[qt] = x0;
            qy[qt] = y0;
            qt++;
            vis[idx0] = 1;
            let size = 0;
            let minX = x0;
            let maxX = x0;
            let minY = y0;
            let maxY = y0;

            while (qh < qt) {
              const x = qx[qh];
              const y = qy[qh];
              qh++;
              size++;
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
              const push = (nx, ny) => {
                const nidx = ny * w + nx;
                if (vis[nidx]) return;
                if (isBg(nidx * 4)) return;
                vis[nidx] = 1;
                qx[qt] = nx;
                qy[qt] = ny;
                qt++;
              };
              if (x > 0) push(x - 1, y);
              if (x < w - 1) push(x + 1, y);
              if (y > 0) push(x, y - 1);
              if (y < h - 1) push(x, y + 1);
            }

            if (size < 80) continue;
            const bw = maxX - minX + 1;
            const bh = maxY - minY + 1;
            if (bw < 12 || bh < 12) continue;
            comps.push({ x: r.x + minX, y: r.y + minY, w: bw, h: bh, size });
          }
        }

        comps.sort((a, b) => (a.y - b.y) || (a.x - b.x));
        return comps;
      };

      const mkPlayerSheet = (q) => {
        const r = quad(q);
        const comps = extractComponents(r);
        if (comps.length < 10) return null;
        const sorted = comps.slice(0, 10).sort((a, b) => (a.y - b.y) || (a.x - b.x));
        const run = sorted.slice(0, 5).sort((a, b) => a.x - b.x);
        const kick = sorted.slice(5, 10).sort((a, b) => a.x - b.x);

        const c = document.createElement("canvas");
        c.width = cell * 5;
        c.height = cell * 3;
        const ctx = c.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, c.width, c.height);
        for (let i = 0; i < 5; i++) drawSprite(run[i], i * cell, 0, ctx);
        for (let i = 0; i < 5; i++) drawSprite(kick[i], i * cell, cell, ctx);
        ctx.drawImage(c, 0, 0, cell, cell, 0, cell * 2, cell, cell);
        return new SpriteSheet(c, cell, cell);
      };

      const mkKeeperSheet = (q) => {
        const r = quad(q);
        const comps = extractComponents(r);
        if (comps.length < 6) return null;
        const sorted = comps.slice(0, 6).sort((a, b) => a.x - b.x);
        const stand = sorted.slice(0, 2).sort((a, b) => a.y - b.y);
        const rest = sorted.slice(2).sort((a, b) => (a.y - b.y) || (a.x - b.x));
        const row1 = rest.slice(0, 2).sort((a, b) => a.x - b.x);
        const row2 = rest.slice(2, 4).sort((a, b) => a.x - b.x);

        const c = document.createElement("canvas");
        c.width = cell * 2;
        c.height = cell * 3;
        const ctx = c.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, c.width, c.height);
        for (let i = 0; i < 2; i++) drawSprite(stand[i], i * cell, 0, ctx);
        for (let i = 0; i < 2; i++) drawSprite(row1[i], i * cell, cell, ctx);
        for (let i = 0; i < 2; i++) drawSprite(row2[i], i * cell, cell * 2, ctx);
        return new SpriteSheet(c, cell, cell);
      };

      out.white = mkPlayerSheet("TL") || null;
      out.blue = mkPlayerSheet("BL") || null;
      out.keeperWhite = mkKeeperSheet("TR") || null;
      out.keeperBlue = mkKeeperSheet("BR") || null;
      return out;
    }

    _makeFallbackBodySheet() {
      const c = document.createElement("canvas");
      c.width = 64 * 5;
      c.height = 64 * 3;
      const ctx = c.getContext("2d");
      ctx.imageSmoothingEnabled = false;

      const cell = 64;
      const drawGuy = (dx, dy, step) => {
        ctx.fillStyle = "#f1c27d";
        ctx.fillRect(dx + 26, dy + 10, 12, 12);
        ctx.fillStyle = "#111";
        ctx.fillRect(dx + 24, dy + 8, 16, 6);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(dx + 24, dy + 22, 16, 18);
        ctx.fillStyle = "#d0d3d9";
        ctx.fillRect(dx + 26, dy + 40, 12, 12);
        ctx.fillStyle = "#333";
        ctx.fillRect(dx + 20 + (step % 2), dy + 52, 10, 4);
        ctx.fillRect(dx + 34 - (step % 2), dy + 52, 10, 4);
      };

      for (let i = 0; i < 5; i++) drawGuy(i * cell, 0, i);
      for (let i = 0; i < 5; i++) drawGuy(i * cell, cell, i + 1);
      drawGuy(0, cell * 2, 0);
      return new SpriteSheet(c, cell, cell);
    }

    _makeFallbackHeadSheet() {
      const c = document.createElement("canvas");
      c.width = 24 * 12;
      c.height = 24;
      const ctx = c.getContext("2d");
      for (let i = 0; i < 12; i++) {
        const ox = i * 24;
        ctx.fillStyle = "#f1c27d";
        ctx.fillRect(ox + 6, 4, 12, 14);
        ctx.fillStyle = i % 3 === 1 ? "#111" : i % 3 === 2 ? "#a00" : "#333";
        ctx.fillRect(ox + 6, 4, 12, 6);
      }
      return new SpriteSheet(c, 24, 24);
    }
  }

  const canvas = document.getElementById("game");
  const game = new Game(canvas);
  game.boot().then(() => game.start()).catch((e) => alert(e.message));
})();
