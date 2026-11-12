import Phaser from 'phaser';
import { traceLaser } from './laser';

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

function directionVector(dir) {
  if (dir === 'left') return { x: -1, y: 0 };
  if (dir === 'up') return { x: 0, y: -1 };
  if (dir === 'down') return { x: 0, y: 1 };
  return { x: 1, y: 0 };
}

function reflectDirection(dir, orientation) {
  if (orientation === '/') {
    if (dir === 'right') return 'up';
    if (dir === 'left') return 'down';
    if (dir === 'up') return 'right';
    if (dir === 'down') return 'left';
  }
  if (dir === 'right') return 'down';
  if (dir === 'left') return 'up';
  if (dir === 'up') return 'left';
  return 'right';
}


export function createPuzzleScene({ level, keymap, onPause, onDeath, onRestart, onComplete, onGemChange }) {
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
      // Las puertas que ya se han abierto: se quedan abiertas. En el juego
      // original hay que mantener el boton pulsado, pero aqui el boton y la
      // caja hay que colocarlos con mucho cuidado y el niño se frustraba
      // (-> la puerta se cerraba justo cuando iba a pasar).
      this.puertasAbiertas = new Set();
      this.onPause = onPause;
      this.onDeath = onDeath;
      this.onRestart = onRestart;
      this.onComplete = onComplete;
      this.onGemChange = onGemChange;
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
      makeTexture(this, 'fw_ice', 64, 16, 0x2d9cdb);
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
      makeTexture(this, 'fw_gem_fire', 18, 18, 0xff5a3c);
      makeTexture(this, 'fw_gem_water', 18, 18, 0x3ca8ff);
      makeTexture(this, 'fw_lever', 28, 18, 0xf2c94c);
      makeTexture(this, 'fw_sensor', 28, 34, 0xf2c94c);
      makeTexture(this, 'fw_mirror', 28, 28, 0xe8eeff);

      const platforms = [];
      const movingPlatforms = [];
      for (const p of this.level.platforms) {
        const textureKey = p.material === 'ice' ? 'fw_ice' : 'fw_platform';
        if (p.kind === 'moving') {
          const mover = this.physics.add.image(p.x, p.y, textureKey);
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
          mover.setData('material', p.material || 'stone');
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
          const img = this.physics.add.staticImage(p.x, p.y, textureKey);
          img.setDisplaySize(p.w, p.h);
          img.refreshBody();
          img.setData('id', p.id);
          img.setData('material', p.material || 'stone');
          platforms.push(img);
        }
      }

      const doors = new Map();
      for (const d of this.level.doors) {
        const door = this.physics.add.staticImage(d.x, d.y, 'fw_door');
        door.setDisplaySize(d.w, d.h);
        door.refreshBody();
        door.setData('id', d.id);
        door.setData('activation', d.activation || 'button');
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

      const levers = [];
      for (const leverData of this.level.levers || []) {
        const lever = this.physics.add.staticImage(leverData.x, leverData.y, 'fw_lever');
        lever.setDisplaySize(leverData.w || 40, leverData.h || 28);
        lever.refreshBody();
        lever.setData('doorId', leverData.doorId);
        lever.setData('active', false);
        levers.push(lever);
      }

      const mirrors = [];
      for (const m of this.level.mirrors || []) {
        const mirror = this.physics.add.staticImage(m.x, m.y, 'fw_mirror');
        mirror.setDisplaySize(28, 28);
        mirror.refreshBody();
        mirror.setData('orientation', m.orientation || '/');
        mirror.setAngle((m.orientation || '/') === '/' ? 45 : -45);
        mirrors.push(mirror);
      }

      const laserSensors = [];
      for (const sensorData of this.level.laserSensors || []) {
        const sensor = this.physics.add.staticImage(sensorData.x, sensorData.y, 'fw_sensor');
        sensor.setDisplaySize(sensorData.w || 40, sensorData.h || 44);
        sensor.refreshBody();
        sensor.setData('doorId', sensorData.doorId);
        sensor.setData('active', false);
        laserSensors.push(sensor);
      }

      const crates = [];
      for (const c of this.level.crates) {
        const crate = this.physics.add.image(c.x, c.y, 'fw_crate');
        crate.setDisplaySize(c.w, c.h);
        crate.setCollideWorldBounds(true);
        crate.setBounce(0.05);
        // La friccion tiene que ser floja: con 650 la caja se quedaba
        // pegada al sitio y no se podia empujar ni al boton, asi que las
        // puertas de boton no se abrian nunca.
        crate.setDrag(40, 0);
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
        this.physics.add.collider(fire, p, (_a, b) => {
          fire.setData('groundMaterial', b?.getData?.('material') || 'stone');
        });
        this.physics.add.collider(water, p, (_a, b) => {
          water.setData('groundMaterial', b?.getData?.('material') || 'stone');
        });
        for (const crate of crates) this.physics.add.collider(crate, p);
      }

      for (const door of doors.values()) {
        this.physics.add.collider(fire, door);
        this.physics.add.collider(water, door);
        for (const crate of crates) this.physics.add.collider(crate, door);
      }

      // El fuego y el agua NO chocan entre si: el fuego va detras del agua
      // al salir, asi que si chocaran, el que va delante acababa empujado
      // al charco y se mataba solo (sin haberlo hecho mal).
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
      this.triggerDeath = die;

      for (const hz of hazards) {
        const element = hz.getData('element');
        this.physics.add.overlap(fire, hz, () => {
          if (element === 'water' || element === 'acid') die();
        });
        this.physics.add.overlap(water, hz, () => {
          if (element === 'lava' || element === 'acid') die();
        });
      }

      this.gemState = { fire: 0, water: 0 };
      this.gemsTotal = { fire: 0, water: 0 };
      const gems = [];
      for (const item of this.level.collectibles || []) {
        if (item.kind !== 'gem') continue;
        const tex = item.owner === 'water' ? 'fw_gem_water' : 'fw_gem_fire';
        const gem = this.physics.add.staticImage(item.x, item.y, tex);
        gem.setDisplaySize(item.w || 18, item.h || 18);
        gem.setAlpha(0.95);
        gem.refreshBody();
        gem.setData('owner', item.owner);
        gems.push(gem);
        if (item.owner === 'water') this.gemsTotal.water += 1;
        else this.gemsTotal.fire += 1;
      }

      for (const gem of gems) {
        const owner = gem.getData('owner');
        this.physics.add.overlap(fire, gem, () => {
          if (owner !== 'fire') return;
          if (!gem.body.enable) return;
          gem.body.enable = false;
          gem.setVisible(false);
          this.gemState.fire += 1;
          this.onGemChange?.({ ...this.gemState, total: { ...this.gemsTotal } });
        });
        this.physics.add.overlap(water, gem, () => {
          if (owner !== 'water') return;
          if (!gem.body.enable) return;
          gem.body.enable = false;
          gem.setVisible(false);
          this.gemState.water += 1;
          this.onGemChange?.({ ...this.gemState, total: { ...this.gemsTotal } });
        });
      }

      this.onGemChange?.({ ...this.gemState, total: { ...this.gemsTotal } });

      this.exitFire = exitFire;
      this.exitWater = exitWater;

      this.fire = fire;
      this.water = water;
      this.buttons = buttons;
      this.levers = levers;
      this.doors = doors;
      this.crates = crates;
      this.movingPlatforms = movingPlatforms;
      this.mirrors = mirrors;
      this.laserSensors = laserSensors;
      this.laserEmitters = this.level.laserEmitters || [];
      this.laserGraphics = this.add.graphics();
      this.laserSegments = [];

      // Las flechas mueven al personaje de agua: sin esto, la página hace
      // scroll mientras se juega y el juego se va de la pantalla.
      this.input.keyboard.addCapture('UP,DOWN,LEFT,RIGHT,SPACE');

      this.input.keyboard.on('keydown', (e) => {
        const list = this.keyIndex.get(e.key);
        if (!list) return;
        for (const item of list) {
          if (item.player === 'system' && item.action === 'pause') this.onPause?.();
          if (item.player === 'system' && item.action === 'restart') this.onRestart?.();
          if (item.player === 'fire' && item.action === 'interact') this.tryInteract('fire');
          if (item.player === 'water' && item.action === 'interact') this.tryInteract('water');
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

      // La cámara sigue a los DOS personajes: hay niveles de hasta 7000 px de
      // ancho y siguiendo solo al de fuego el otro se salía de la pantalla.
      this.followTarget = { x: this.fire.x, y: this.fire.y };
      this.cameras.main.startFollow(this.followTarget, true, 0.08, 0.08);
      this.cameras.main.setDeadzone(220, 120);
      // Y se aleja un poco en los niveles anchos para que quepan los dos.
      const anchoNivel = this.level.size?.width || 2400;
      this.cameras.main.setZoom(Math.max(0.6, Math.min(1, 1100 / anchoNivel)));
    }

    tryInteract(playerName) {
      const sprite = playerName === 'fire' ? this.fire : this.water;
      if (!sprite?.body) return;

      let bestLever = null;
      let bestDist = Infinity;
      for (const lever of this.levers || []) {
        const dist = Phaser.Math.Distance.Between(sprite.x, sprite.y, lever.x, lever.y);
        if (dist < 84 && dist < bestDist) {
          bestLever = lever;
          bestDist = dist;
        }
      }
      if (bestLever) {
        const next = !bestLever.getData('active');
        bestLever.setData('active', next);
        bestLever.setAngle(next ? -35 : 0);
        return;
      }

      let bestMirror = null;
      bestDist = Infinity;
      for (const mirror of this.mirrors || []) {
        const dist = Phaser.Math.Distance.Between(sprite.x, sprite.y, mirror.x, mirror.y);
        if (dist < 90 && dist < bestDist) {
          bestMirror = mirror;
          bestDist = dist;
        }
      }
      if (bestMirror) {
        const next = bestMirror.getData('orientation') === '/' ? '\\' : '/';
        bestMirror.setData('orientation', next);
        bestMirror.setAngle(next === '/' ? 45 : -45);
      }
    }

    updateLasers() {
      const graphics = this.laserGraphics;
      if (!graphics) return;
      graphics.clear();
      graphics.lineStyle(3, 0xf6e56f, 0.95);
      this.laserSegments = [];

      const { segmentos, sensores } = traceLaser(this.level);
      this.laserSegments = segmentos;
      for (const sensor of this.laserSensors || []) sensor.setData('active', false);
      for (const id of sensores) {
        const sensor = (this.laserSensors || []).find((s) => s.id === id);
        if (sensor) sensor.setData('active', true);
      }

      for (const seg of segmentos) {
        graphics.beginPath();
        graphics.moveTo(seg.x1, seg.y1);
        graphics.lineTo(seg.x2, seg.y2);
        graphics.strokePath();
      }
    }

    update() {
      if (this.isPausedExternally) return;
      if (!this.fire?.body || !this.water?.body) return;

      // El punto que sigue la cámara va entre los dos personajes.
      if (this.followTarget) {
        this.followTarget.x = (this.fire.x + this.water.x) / 2;
        this.followTarget.y = (this.fire.y + this.water.y) / 2;
      }

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

      this.updateLasers();

      const speed = 220;
      const jump = -470;

      const apply = (sprite, state) => {
        let vx = 0;
        if (state.left) vx -= speed;
        if (state.right) vx += speed;
        if (!sprite.body.blocked.down) sprite.setData('groundMaterial', null);
        const mat = sprite.getData('groundMaterial');
        const onIce = mat === 'ice' && sprite.body.blocked.down;
        const factor = onIce ? 0.06 : sprite.body.blocked.down ? 0.22 : 0.12;
        const current = sprite.body.velocity.x;
        sprite.setVelocityX(current + (vx - current) * factor);
        if (state.jump && sprite.body.blocked.down) sprite.setVelocityY(jump);
      };

      apply(this.fire, this.inputState.fire);
      apply(this.water, this.inputState.water);

      const hitByLaser = (sprite) =>
        (this.laserSegments || []).some(seg => {
          if (Math.abs(seg.x1 - seg.x2) < 1) {
            const minY = Math.min(seg.y1, seg.y2);
            const maxY = Math.max(seg.y1, seg.y2);
            return Math.abs(sprite.x - seg.x1) < 12 && sprite.y > minY && sprite.y < maxY;
          }
          const minX = Math.min(seg.x1, seg.x2);
          const maxX = Math.max(seg.x1, seg.x2);
          return Math.abs(sprite.y - seg.y1) < 12 && sprite.x > minX && sprite.x < maxX;
        });

      if (hitByLaser(this.fire) || hitByLaser(this.water)) {
        this.triggerDeath?.();
        return;
      }

      const activeButtonDoors = new Set();
      for (const btn of this.buttons) {
        const pressed =
          this.physics.overlap(btn, this.fire) ||
          this.physics.overlap(btn, this.water) ||
          this.crates.some(c => this.physics.overlap(btn, c));

        const doorId = btn.getData('doorId');
        const door = this.doors.get(doorId);
        if (!door) continue;
        if (door.getData('activation') === 'button' && pressed) activeButtonDoors.add(doorId);
      }

      const activeLeverDoors = new Set(
        (this.levers || []).filter(lever => lever.getData('active')).map(lever => lever.getData('doorId'))
      );
      const activeLaserDoors = new Set(
        (this.laserSensors || []).filter(sensor => sensor.getData('active')).map(sensor => sensor.getData('doorId'))
      );

      for (const lever of this.levers || []) {
        lever.setTint(lever.getData('active') ? 0x2ed47a : 0xf2c94c);
      }
      for (const sensor of this.laserSensors || []) {
        sensor.setTint(sensor.getData('active') ? 0x2ed47a : 0xf2c94c);
      }

      for (const door of this.doors.values()) {
        const activation = door.getData('activation') || 'button';
        const shouldOpen =
          (activation === 'button' && activeButtonDoors.has(door.getData('id'))) ||
          (activation === 'lever' && activeLeverDoors.has(door.getData('id'))) ||
          (activation === 'laser' && activeLaserDoors.has(door.getData('id')));

        // Las puertas de boton se quedan abiertas para siempre; la palanca y
        // el laser siguen siendo momentaneos (la palanca se puede volver a
        // cerrar).
        if (shouldOpen && activation === 'button') this.puertasAbiertas.add(door.getData('id'));
        const abierta = activation === 'button'
          ? this.puertasAbiertas.has(door.getData('id'))
          : shouldOpen;

        if (abierta) {
          if (door.body.enable) {
            door.body.enable = false;
            door.setVisible(false);
          }
        } else if (!door.body.enable) {
          door.body.enable = true;
          door.setVisible(true);
          door.refreshBody();
        }
      }

      const gemsComplete =
        this.gemState.fire >= this.gemsTotal.fire &&
        this.gemState.water >= this.gemsTotal.water;
      this.exitFire.setAlpha(gemsComplete ? 0.95 : 0.35);
      this.exitWater.setAlpha(gemsComplete ? 0.95 : 0.35);

      this.exitState.fire = this.physics.overlap(this.fire, this.exitFire);
      this.exitState.water = this.physics.overlap(this.water, this.exitWater);

      if (!this.exitState.done && gemsComplete && this.exitState.fire && this.exitState.water) {
        this.exitState.done = true;
        this.onComplete?.();
      }
    }
  };
}
