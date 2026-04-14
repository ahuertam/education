import Phaser from 'phaser';

function makeTexture(scene, key, w, h, color) {
  if (scene.textures.exists(key)) return;
  const g = scene.add.graphics();
  g.fillStyle(color, 1);
  g.fillRoundedRect(0, 0, w, h, Math.min(12, Math.floor(Math.min(w, h) / 4)));
  g.generateTexture(key, w, h);
  g.destroy();
}

function buildKeyIndex(keymap) {
  const index = new Map();
  for (const [player, mapping] of Object.entries({ fire: keymap.fire, water: keymap.water, system: keymap.system })) {
    for (const [action, key] of Object.entries(mapping)) {
      if (!index.has(key)) index.set(key, []);
      index.get(key).push({ player, action });
    }
  }
  return index;
}

export function createPuzzleScene({ level, keymap, onPause, onDeath, onRestart, onComplete }) {
  const keyIndex = buildKeyIndex(keymap);
  const sceneKey = 'FireWaterPuzzleScene';

  return class FireWaterPuzzleScene extends Phaser.Scene {
    constructor() {
      super(sceneKey);
      this.level = level;
      this.keyIndex = keyIndex;
      this.inputState = {
        fire: { left: false, right: false, jump: false },
        water: { left: false, right: false, jump: false }
      };
      this.exitState = { fire: false, water: false, done: false };
      this.onPause = onPause;
      this.onDeath = onDeath;
      this.onRestart = onRestart;
      this.onComplete = onComplete;
      this.isPausedExternally = false;
      this.deathLocked = false;
    }

    setPaused(paused) {
      this.isPausedExternally = paused;
      if (paused) {
        this.physics.world.pause();
      } else {
        this.physics.world.resume();
      }
    }

    create() {
      const w = this.level.size.width;
      const h = this.level.size.height;

      this.cameras.main.setBackgroundColor('#0B1020');
      this.physics.world.setBounds(0, 0, w, h);
      this.cameras.main.setBounds(0, 0, w, h);

      makeTexture(this, 'fw_platform', 64, 16, 0x24304f);
      makeTexture(this, 'fw_door', 28, 60, 0x8893b5);
      makeTexture(this, 'fw_fire', 32, 44, 0xff5a3c);
      makeTexture(this, 'fw_water', 32, 44, 0x3ca8ff);
      makeTexture(this, 'fw_crate', 36, 36, 0xc89c5a);
      makeTexture(this, 'fw_btn', 36, 12, 0x2ed47a);
      makeTexture(this, 'fw_exit_fire', 42, 62, 0xff5a3c);
      makeTexture(this, 'fw_exit_water', 42, 62, 0x3ca8ff);
      makeTexture(this, 'fw_hz_lava', 64, 12, 0xff3b5c);
      makeTexture(this, 'fw_hz_water', 64, 12, 0x2d9cdb);
      makeTexture(this, 'fw_hz_acid', 64, 12, 0x2ed47a);

      const platforms = [];
      const movingPlatforms = [];
      for (const p of this.level.platforms) {
        if (p.kind === 'moving') {
          const mover = this.physics.add.image(p.x, p.y, 'fw_platform');
          mover.setDisplaySize(p.w, p.h);
          mover.setImmovable(true);
          if (mover.body?.setAllowGravity) {
            mover.body.setAllowGravity(false);
          } else if (mover.body) {
            mover.body.allowGravity = false;
          }
          if (mover.body?.setSize) mover.body.setSize(p.w, p.h, true);
          mover.setData('id', p.id);
          mover.setData('kind', 'moving');
          const axis = p.axis || (typeof p.vy === 'number' ? 'y' : 'x');
          mover.setData('axis', axis);
          mover.setData('baseX', p.x);
          mover.setData('baseY', p.y);
          mover.setData('rangeX', p.rangeX ?? p.range ?? 140);
          mover.setData('rangeY', p.rangeY ?? 140);
          if (axis === 'y') {
            mover.setVelocityX(0);
            mover.setVelocityY(p.vy ?? 90);
          } else {
            mover.setVelocityX(p.vx ?? 90);
            mover.setVelocityY(0);
          }
          platforms.push(mover);
          movingPlatforms.push(mover);
        } else {
          const img = this.physics.add.staticImage(p.x, p.y, 'fw_platform');
          img.setDisplaySize(p.w, p.h);
          img.refreshBody();
          img.setData('id', p.id);
          platforms.push(img);
        }
      }

      const doors = new Map();
      for (const d of this.level.doors) {
        const door = this.physics.add.staticImage(d.x, d.y, 'fw_door');
        door.setDisplaySize(d.w, d.h);
        door.refreshBody();
        door.setData('id', d.id);
        doors.set(d.id, door);
      }

      const buttons = [];
      for (const b of this.level.buttons) {
        const btn = this.physics.add.staticImage(b.x, b.y, 'fw_btn');
        btn.setDisplaySize(b.w, b.h);
        btn.refreshBody();
        btn.setData('doorId', b.doorId);
        buttons.push(btn);
      }

      const crates = [];
      for (const c of this.level.crates) {
        const crate = this.physics.add.image(c.x, c.y, 'fw_crate');
        crate.setDisplaySize(c.w, c.h);
        crate.setCollideWorldBounds(true);
        crate.setBounce(0.05);
        crate.setDrag(650, 0);
        crates.push(crate);
      }

      const hazards = [];
      for (const hz of this.level.hazards) {
        const tex = hz.element === 'lava' ? 'fw_hz_lava' : hz.element === 'water' ? 'fw_hz_water' : 'fw_hz_acid';
        const hImg = this.physics.add.staticImage(hz.x, hz.y, tex);
        hImg.setDisplaySize(hz.w, hz.h);
        hImg.setAlpha(0.85);
        hImg.refreshBody();
        hImg.setData('element', hz.element);
        hazards.push(hImg);
      }

      const fire = this.physics.add.sprite(this.level.spawns.fire.x, this.level.spawns.fire.y, 'fw_fire');
      const water = this.physics.add.sprite(this.level.spawns.water.x, this.level.spawns.water.y, 'fw_water');
      fire.setCollideWorldBounds(true);
      water.setCollideWorldBounds(true);
      fire.setBounce(0);
      water.setBounce(0);

      fire.body.setSize(24, 40, true);
      water.body.setSize(24, 40, true);

      for (const p of platforms) {
        this.physics.add.collider(fire, p);
        this.physics.add.collider(water, p);
        for (const crate of crates) this.physics.add.collider(crate, p);
      }

      for (const door of doors.values()) {
        this.physics.add.collider(fire, door);
        this.physics.add.collider(water, door);
        for (const crate of crates) this.physics.add.collider(crate, door);
      }

      this.physics.add.collider(fire, water);
      for (const crate of crates) {
        this.physics.add.collider(fire, crate);
        this.physics.add.collider(water, crate);
        for (const other of crates) {
          if (other === crate) continue;
          this.physics.add.collider(crate, other);
        }
      }

      const exitFire = this.physics.add.staticImage(this.level.exits.fire.x, this.level.exits.fire.y, 'fw_exit_fire');
      exitFire.setDisplaySize(this.level.exits.fire.w, this.level.exits.fire.h);
      exitFire.setAlpha(0.8);
      exitFire.refreshBody();

      const exitWater = this.physics.add.staticImage(this.level.exits.water.x, this.level.exits.water.y, 'fw_exit_water');
      exitWater.setDisplaySize(this.level.exits.water.w, this.level.exits.water.h);
      exitWater.setAlpha(0.8);
      exitWater.refreshBody();

      const die = () => {
        if (this.deathLocked) return;
        this.deathLocked = true;
        this.onDeath?.();
      };

      for (const hz of hazards) {
        const element = hz.getData('element');
        this.physics.add.overlap(fire, hz, () => {
          if (element === 'water' || element === 'acid') die();
        });
        this.physics.add.overlap(water, hz, () => {
          if (element === 'lava' || element === 'acid') die();
        });
      }

      this.exitFire = exitFire;
      this.exitWater = exitWater;

      this.fire = fire;
      this.water = water;
      this.buttons = buttons;
      this.doors = doors;
      this.crates = crates;
      this.movingPlatforms = movingPlatforms;

      this.input.keyboard.on('keydown', (e) => {
        const list = this.keyIndex.get(e.key);
        if (!list) return;
        for (const item of list) {
          if (item.player === 'system' && item.action === 'pause') this.onPause?.();
          if (item.player === 'system' && item.action === 'restart') this.onRestart?.();
          if (item.player === 'fire') this.inputState.fire[item.action] = true;
          if (item.player === 'water') this.inputState.water[item.action] = true;
        }
      });
      this.input.keyboard.on('keyup', (e) => {
        const list = this.keyIndex.get(e.key);
        if (!list) return;
        for (const item of list) {
          if (item.player === 'fire') this.inputState.fire[item.action] = false;
          if (item.player === 'water') this.inputState.water[item.action] = false;
        }
      });

      this.cameras.main.startFollow(this.fire, true, 0.08, 0.08);
      this.cameras.main.setDeadzone(220, 120);
    }

    update() {
      if (this.isPausedExternally) return;
      if (!this.fire?.body || !this.water?.body) return;

      for (const mp of this.movingPlatforms || []) {
        const axis = mp.getData('axis') || 'x';
        if (axis === 'y') {
          const baseY = mp.getData('baseY');
          const rangeY = mp.getData('rangeY') ?? 140;
          if (mp.y < baseY - rangeY) mp.setVelocityY(Math.abs(mp.body.velocity.y));
          if (mp.y > baseY + rangeY) mp.setVelocityY(-Math.abs(mp.body.velocity.y));
        } else {
          const baseX = mp.getData('baseX');
          const rangeX = mp.getData('rangeX') ?? 140;
          if (mp.x < baseX - rangeX) mp.setVelocityX(Math.abs(mp.body.velocity.x));
          if (mp.x > baseX + rangeX) mp.setVelocityX(-Math.abs(mp.body.velocity.x));
        }
      }

      const speed = 220;
      const jump = -470;

      const apply = (sprite, state) => {
        let vx = 0;
        if (state.left) vx -= speed;
        if (state.right) vx += speed;
        sprite.setVelocityX(vx);
        if (state.jump && sprite.body.blocked.down) sprite.setVelocityY(jump);
      };

      apply(this.fire, this.inputState.fire);
      apply(this.water, this.inputState.water);

      for (const btn of this.buttons) {
        const pressed =
          this.physics.overlap(btn, this.fire) ||
          this.physics.overlap(btn, this.water) ||
          this.crates.some(c => this.physics.overlap(btn, c));

        const doorId = btn.getData('doorId');
        const door = this.doors.get(doorId);
        if (!door) continue;

        if (pressed) {
          if (door.body.enable) {
            door.body.enable = false;
            door.setVisible(false);
          }
        } else {
          if (!door.body.enable) {
            door.body.enable = true;
            door.setVisible(true);
            door.refreshBody();
          }
        }
      }

      this.exitState.fire = this.physics.overlap(this.fire, this.exitFire);
      this.exitState.water = this.physics.overlap(this.water, this.exitWater);

      if (!this.exitState.done && this.exitState.fire && this.exitState.water) {
        this.exitState.done = true;
        this.onComplete?.();
      }
    }
  };
}
