import Phaser from 'phaser';
import confetti from 'canvas-confetti';
import { L3_BRIDGE, TREE_BASES, movePlayer, touchesTerrain } from './terrain';
import type { ParticipantStage } from '../data/participantStages';
import { STAGE_QUIZZES } from '../data/mockQuests';
import { STAGE_MONSTERS, monsterArtPath, type StageMonster } from '../data/stageMonsters';

import { getHeroSprite, getSavedHeroGender } from '../data/heroCharacters';

export type StageEncounter = { id: string; name: string; locked: boolean };
type Movement = { x: number; y: number };
type Facing = 'down' | 'right' | 'up' | 'left';
const MAP_SIZE = 640;
const ENCOUNTER_RADIUS = 100;

export class ArenaScene extends Phaser.Scene {
  private player: Phaser.GameObjects.Sprite | null = null;
  private shadow: Phaser.GameObjects.Image | null = null;
  private mapPixels: Uint8ClampedArray | null = null;
  private mapWidth = MAP_SIZE;
  private mapHeight = MAP_SIZE;
  private nearbyEncounter: StageEncounter | null = null;
  private monsterSprites: { monster: StageMonster; sprite: Phaser.GameObjects.Image }[] = [];
  private isKnockedBack = false;
  private lastKnockbackTime = 0;
  private facing: Facing = 'down';

  constructor(
    private readonly stage: ParticipantStage,
    private readonly readMovement: () => Movement,
    private readonly readDefeats: () => readonly string[],
    private readonly onNearbyEncounter: (encounter: StageEncounter | null) => void,
    private readonly onEncounterInteract: (encounter: StageEncounter) => void,
    private readonly onReady: () => void,
    private readonly heroSpritesheetUrl?: string,
  ) {
    super(`stage-${stage.ordinal}`);
  }

  preload() {
    this.load.image('world-map', this.stage.mapPath);
    this.load.image('player-shadow', '/assets/mixel/MainCharacter%20v.1.0/MainC_Shadow.png');
    const heroSprite = this.heroSpritesheetUrl || getHeroSprite('professional', getSavedHeroGender());
    this.load.spritesheet('hero', heroSprite, { frameWidth: 96, frameHeight: 96 });
    for (const monster of STAGE_MONSTERS[this.stage.ordinal]) this.load.image(monster.art, monsterArtPath(monster.art));
  }

  create() {
    const scale = this.stage.mapScale;
    this.add.image(this.stage.worldSize / 2, this.stage.worldSize / 2, 'world-map').setScale(scale);

    const source = this.textures.get('world-map').getSourceImage() as HTMLImageElement;
    this.mapWidth = source.width;
    this.mapHeight = source.height;
    const mapCanvas = document.createElement('canvas');
    mapCanvas.width = this.mapWidth;
    mapCanvas.height = this.mapHeight;
    const context = mapCanvas.getContext('2d', { willReadFrequently: true });
    if (context) {
      context.drawImage(source, 0, 0);
      this.mapPixels = context.getImageData(0, 0, this.mapWidth, this.mapHeight).data;
    }

    this.drawBridge();
    this.drawCanopies(source);
    this.createAnimations();
    this.drawMonsters();
    this.spawnPlayer();
    this.onReady();
  }

  update(_time: number, delta: number) {
    if (!this.player) return;

    const defeats = this.readDefeats();
    const bossUnlocked = STAGE_MONSTERS[this.stage.ordinal].slice(0, 2).every(monster => defeats.includes(monster.quizId));

    // Check boss barrier knockback trigger if player approaches locked boss
    const bossEntry = this.monsterSprites.find(({ monster }) => monster.boss);
    if (bossEntry && !bossUnlocked) {
      const distToBoss = Phaser.Math.Distance.Between(this.player.x, this.player.y, bossEntry.monster.x, bossEntry.monster.y);
      if (distToBoss < 85 && _time - this.lastKnockbackTime > 1100 && !this.isKnockedBack) {
        this.triggerBossBarrierRepel(bossEntry.monster);
        this.lastKnockbackTime = _time;
      }
    }

    if (!this.isKnockedBack) {
      const input = this.readMovement();
      const { x, y } = input;
      if (Math.hypot(x, y) > 0.08) {
        this.facing = Math.abs(x) > Math.abs(y) ? (x > 0 ? 'right' : 'left') : (y > 0 ? 'down' : 'up');
        const next = movePlayer(this.player, input, delta, this.stage.worldSize, point =>
          touchesTerrain(this.stage.ordinal, this.stage.mapScale, point, this.mapPixels, this.mapWidth, this.mapHeight)
          || this.monsterSprites.some(({ monster }) => Phaser.Math.Distance.Between(point.x, point.y, monster.x, monster.y) < (monster.boss ? (bossUnlocked ? 45 : 85) : 27)));
        const moved = next.x !== this.player.x || next.y !== this.player.y;
        this.player.setPosition(next.x, next.y).anims.play(`hero-${this.facing}-${moved ? 'walk' : 'idle'}`, true);
      } else this.player.anims.play(`hero-${this.facing}-idle`, true);
    }

    this.player.setDepth(this.player.y);
    this.shadow?.setPosition(this.player.x, this.player.y - 4).setDepth(this.player.y - 1);
    for (const { monster, sprite } of this.monsterSprites) {
      sprite.setTint(defeats.includes(monster.quizId) ? 0xb7d5ba : monster.boss && !bossUnlocked ? 0x8094a1 : 0xffffff);
    }
    const nearby: { distance: number; encounter: StageEncounter }[] = this.monsterSprites.map(({ monster }) => ({
      distance: Phaser.Math.Distance.Between(this.player!.x, this.player!.y, monster.x, monster.y),
      encounter: { id: monster.quizId, name: STAGE_QUIZZES.find(quiz => quiz.id === monster.quizId)?.enemyName || 'Monster', locked: Boolean(monster.boss && !bossUnlocked) },
    }));
    const encounter = nearby.filter(item => item.distance <= ENCOUNTER_RADIUS).sort((a, b) => a.distance - b.distance)[0]?.encounter || null;
    if (encounter?.id !== this.nearbyEncounter?.id || encounter?.locked !== this.nearbyEncounter?.locked) {
      this.nearbyEncounter = encounter;
      this.onNearbyEncounter(encounter);
    }
  }

  interact() {
    if (this.nearbyEncounter) {
      if (!this.nearbyEncounter.locked) {
        this.onEncounterInteract(this.nearbyEncounter);
      } else {
        const bossEntry = this.monsterSprites.find(({ monster }) => monster.boss);
        if (bossEntry && !this.isKnockedBack) {
          this.triggerBossBarrierRepel(bossEntry.monster);
        }
      }
    }
  }

  private spawnPlayer() {
    const { x, y } = this.stage.spawn;
    this.shadow = this.add.image(x, y - 4, 'player-shadow').setDisplaySize(68, 40).setAlpha(0.8).setDepth(y - 1);
    this.player = this.add.sprite(x, y, 'hero').setOrigin(0.5, 1).setScale(0.925).setDepth(y).play('hero-down-idle');
    const updateCamera = () => this.cameras.main.setZoom(Math.max(this.scale.width < 768 || this.scale.height < 480 ? 0.8 : 1, this.scale.width/this.stage.worldSize, this.scale.height/this.stage.worldSize));
    this.cameras.main.roundPixels = true;
    this.cameras.main.setBounds(0, 0, this.stage.worldSize, this.stage.worldSize).startFollow(this.player, true, 0.12, 0.12, 0, 32);
    updateCamera();
    this.scale.on('resize', updateCamera);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off('resize', updateCamera));
  }

  private drawBridge() {
    if (this.stage.ordinal !== 1) return;
    const [x,y,w,h]=L3_BRIDGE, scale=this.stage.mapScale;
    // Reuse this map's rope bridge, with its water/grass background made transparent.
    const texture=this.textures.createCanvas('island-bridge',w,72);
    if (!texture) return;
    const ctx=texture.context;
    ctx.imageSmoothingEnabled=false;
    ctx.drawImage(this.textures.get('world-map').getSourceImage() as HTMLImageElement,584,32,176,96,0,0,w,72);
    const pixels=ctx.getImageData(0,0,w,72);
    for(let i=0;i<pixels.data.length;i+=4){const [r,g,b]=pixels.data.subarray(i,i+3);if(b>r+25 || g>r+8)pixels.data[i+3]=0;}
    ctx.putImageData(pixels,0,0);texture.refresh();
    this.add.image((x+w/2)*scale,(y+h/2)*scale,'island-bridge').setScale(scale).setDepth(1);
  }

  private drawCanopies(source: HTMLImageElement) {
    const scale=this.stage.mapScale;
    const canopies = (TREE_BASES[this.stage.ordinal] ?? []).map(([x,y]) => [x-32,y-60,64,52,x,y]);
    if (canopies.length === 0) return;
    canopies.forEach(([x,y,w,h,baseX,baseY],index) => {
      const texture=this.textures.createCanvas(`canopy-${index}`,w,h);
      if (!texture) return;
      const ctx=texture.context;
      // Crop the baked canopy into a foreground ellipse. The transparent corners keep paths visible.
      ctx.beginPath();ctx.ellipse(w/2,h/2,w/2,h/2,0,0,Math.PI*2);ctx.clip();
      ctx.drawImage(source,x,y,w,h,0,0,w,h);
      // Clear only background connected to the crop edge; keep the enclosed leaf pixels intact.
      const pixels=ctx.getImageData(0,0,w,h), seen=new Uint8Array(w*h), queue:number[]=[];
      const ground=new Set([0x95bb1f,0x8fb31e]);
      const visit=(i:number)=>{if(i<0||i>=w*h||seen[i])return;seen[i]=1;const p=i*4,d=pixels.data;if(!d[p+3]||ground.has((d[p]<<16)|(d[p+1]<<8)|d[p+2])){d[p+3]=0;queue.push(i);}};
      for(let i=0;i<w*h;i++)if(!pixels.data[i*4+3])visit(i);
      for(let i=0;i<queue.length;i++){const p=queue[i];if(p%w)visit(p-1);if(p%w<w-1)visit(p+1);visit(p-w);visit(p+w);}
      ctx.putImageData(pixels,0,0);texture.refresh();
      this.add.image((x+w/2)*scale,(y+h/2)*scale,`canopy-${index}`).setScale(scale).setDepth(baseY*scale);
    });
  }

  private createAnimations() {
    (['down', 'right', 'up', 'left'] as const).forEach((direction, index) => {
      const idleStart = index * 4;
      const walkStart = (index + 4) * 4;
      this.anims.create({ key: `hero-${direction}-idle`, frames: this.anims.generateFrameNumbers('hero', { start: idleStart, end: idleStart + 3 }), frameRate: 5, repeat: -1 });
      this.anims.create({ key: `hero-${direction}-walk`, frames: this.anims.generateFrameNumbers('hero', { start: walkStart, end: walkStart + 3 }), frameRate: 8, repeat: -1 });
    });
  }

  private drawMonsters() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    STAGE_MONSTERS[this.stage.ordinal].forEach((monster, index) => {
      const source = this.textures.get(monster.art).getSourceImage() as HTMLImageElement;
      const height = monster.boss ? 110 : monster.art === 'enemy040' ? 140 : monster.art === 'enemy044f' ? 120 : 82;
      const width = Math.min(monster.boss ? 210 : monster.art === 'enemy040' ? 150 : monster.art === 'enemy044f' ? 130 : 100, height * source.width / source.height);
      this.add.ellipse(monster.x, monster.y - 4, monster.boss ? 148 : 94, monster.boss ? 42 : 30, 0xff3b30, 0.18)
        .setStrokeStyle(4, 0xff3b30, 0.95)
        .setDepth(monster.y - 2);

      const sprite = this.add.image(monster.x, monster.y, monster.art).setOrigin(0.5, 1).setDisplaySize(width, height).setDepth(monster.y);
      this.monsterSprites.push({ monster, sprite });
      if (!reducedMotion) this.tweens.add({ targets: sprite, y: monster.y - 4, duration: 1500 + index * 180, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    });
  }

  celebrateQuiz(quizId: string) {
    const monster = STAGE_MONSTERS[this.stage.ordinal].find(item => item.quizId === quizId);
    if (!monster) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const x = monster.x;
    const y = monster.y - (monster.boss ? 45 : 32);
    const camera = this.cameras.main;
    const bounds = this.game.canvas.getBoundingClientRect();
    const origin = {
      x: (bounds.left + (x - camera.worldView.x) / camera.worldView.width * bounds.width) / window.innerWidth,
      y: (bounds.top + (y - camera.worldView.y) / camera.worldView.height * bounds.height) / window.innerHeight,
    };
    confetti({
      particleCount: monster.boss ? 150 : 95,
      spread: monster.boss ? 70 : 55,
      startVelocity: monster.boss ? 30 : 23,
      ticks: 110,
      gravity: 1.3,
      scalar: 0.8,
      origin,
      colors: ['#f26f21', '#ffd166', '#ffffff', '#2e8b74'],
    });
    const count = monster.boss ? 32 : 20;
    const colors = [0xf26f21, 0xffd166, 0xffffff, 0x2e8b74];
    const ring = this.add.circle(x, y, 22).setStrokeStyle(5, 0xffd166).setDepth(monster.y + 8);
    this.tweens.add({ targets: ring, scale: monster.boss ? 4 : 3, alpha: 0, duration: 700, ease: 'Cubic.easeOut', onComplete: () => ring.destroy() });
    for (let index = 0; index < count; index++) {
      const angle = index * Math.PI * 2 / count;
      const distance = (monster.boss ? 95 : 65) * (0.7 + (index % 4) * 0.1);
      const spark = this.add.rectangle(x, y, index % 3 === 0 ? 9 : 6, index % 3 === 0 ? 9 : 6, colors[index % colors.length]).setDepth(monster.y + 9);
      this.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance + 16,
        angle: 180 + index * 23,
        alpha: 0,
        duration: monster.boss ? 950 : 750,
        ease: 'Cubic.easeOut',
        onComplete: () => spark.destroy(),
      });
    }
  }

  private triggerBossBarrierRepel(monster: StageMonster) {
    if (!this.player) return;

    // 1. Synthesize punchy retro electrical zap / damage sound via Web Audio API
    try {
      const soundMgr = this.sound as any;
      const ctx = soundMgr?.context as AudioContext | undefined;
      if (ctx && ctx.state === 'running') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(170, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(32, ctx.currentTime + 0.22);
        gain.gain.setValueAtTime(0.28, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
      }
    } catch {}

    // 2. Red camera flash & tactile screen shake
    this.cameras.main.flash(200, 240, 45, 45);
    this.cameras.main.shake(250, 0.016);

    // 3. Player sprite damage flashing (alternating red and white)
    this.tweens.addCounter({
      from: 0,
      to: 6,
      duration: 450,
      onUpdate: (tw) => {
        const val = tw.getValue();
        const v = Math.floor(typeof val === 'number' ? val : 0);
        this.player?.setTint(v % 2 === 1 ? 0xff2a2a : 0xffffff);
      },
      onComplete: () => {
        this.player?.clearTint();
      }
    });

    // 4. Forcefield barrier shockwave expanding ring
    const ring = this.add.circle(monster.x, monster.y - 30, 42);
    ring.setStrokeStyle(4, 0xff3b30, 0.95);
    ring.setFillStyle(0xff3b30, 0.25);
    ring.setDepth(monster.y + 15);
    this.tweens.add({
      targets: ring,
      radius: 120,
      alpha: 0,
      duration: 380,
      ease: 'Cubic.easeOut',
      onComplete: () => ring.destroy()
    });

    // 5. Knockback physics (rebounding player backwards away from boss)
    const angle = Phaser.Math.Angle.Between(monster.x, monster.y, this.player.x, this.player.y);
    const pushDist = 120;
    let targetX = this.player.x;
    let targetY = this.player.y;
    for (let distance = 8; distance <= pushDist; distance += 8) {
      const x = Phaser.Math.Clamp(this.player.x + Math.cos(angle) * distance, 30, this.stage.worldSize - 30);
      const y = Phaser.Math.Clamp(this.player.y + Math.sin(angle) * distance, 30, this.stage.worldSize - 30);
      if (touchesTerrain(this.stage.ordinal, this.stage.mapScale, { x, y }, this.mapPixels, this.mapWidth, this.mapHeight)) break;
      targetX = x;
      targetY = y;
    }

    this.isKnockedBack = true;
    this.player.anims.play(`hero-${this.facing}-idle`, true);
    this.tweens.add({
      targets: this.player,
      x: targetX,
      y: targetY,
      duration: 280,
      ease: 'Cubic.easeOut',
      onUpdate: () => {
        if (this.player && this.shadow) {
          this.shadow.setPosition(this.player.x, this.player.y - 4);
          this.player.setDepth(this.player.y);
          this.shadow.setDepth(this.player.y - 1);
        }
      },
      onComplete: () => {
        this.isKnockedBack = false;
      }
    });

    // 6. Floating barrier warning text above player
    const popup = this.add.text(this.player.x, this.player.y - 55, '⚡ SHIELD BOSS AKTIF!\nKALAHKAN PENJAGA DULU!', {
      fontFamily: '"Pixelify Sans", sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ff4d4d',
      stroke: '#081120',
      strokeThickness: 4,
      align: 'center'
    }).setOrigin(0.5, 1).setDepth(this.stage.worldSize + 100);

    this.tweens.add({
      targets: popup,
      y: popup.y - 35,
      alpha: 0,
      duration: 1300,
      ease: 'Power2',
      onComplete: () => popup.destroy()
    });
  }
}
