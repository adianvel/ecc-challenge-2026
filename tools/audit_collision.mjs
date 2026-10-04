// Run with: node tools/audit_collision.mjs
// Writes map overlays and checks whether each quiz monster can be approached from spawn.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PNG } from 'pngjs';
import ts from 'typescript';

async function loadSource(file) {
  const source = readFileSync(join(process.cwd(), 'src', file), 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
}
const [{ touchesTerrain }, { PARTICIPANT_STAGES }, { STAGE_MONSTERS }] = await Promise.all([
  loadSource('game/terrain.ts'), loadSource('data/participantStages.ts'), loadSource('data/stageMonsters.ts'),
]);

const checks = {
  1: [[175, 80, true, 'small boulder'], [670, 80, false, 'north bridge'], [670, 200, true, 'river'], [840, 485, true, 'water beside lily pads'], [925, 540, true, 'water below east bank']],
  2: [[400, 260, false, 'floor west of pillar'], [435, 300, true, 'pillar base'], [792, 455, false, 'floor below wall torch']],
  3: [[670, 720, true, 'ice crystal'], [512, 850, false, 'entrance path'], [30, 500, true, 'outer ice']],
  4: [[374, 736, true, 'gold lamp'], [512, 900, false, 'entrance stairs'], [260, 330, true, 'pool'], [100, 500, true, 'outer sky']],
};
const cell = 8; // source-image pixels
const lilyPath = [[797, 530], [815, 530], [845, 530], [878, 530], [878, 495], [910, 495], [929, 495]];
const output = join(process.cwd(), '.scratch', 'collision-audit');
mkdirSync(output, { recursive: true });

function tint(png, x, y, color, alpha = 0.45) {
  for (let py = Math.max(0, y); py < Math.min(png.height, y + cell); py++) {
    for (let px = Math.max(0, x); px < Math.min(png.width, x + cell); px++) {
      const i = (py * png.width + px) * 4;
      for (let c = 0; c < 3; c++) png.data[i + c] = Math.round(png.data[i + c] * (1 - alpha) + color[c] * alpha);
    }
  }
}

let failures = 0;
for (const stageData of PARTICIPANT_STAGES) {
  const stage = stageData.ordinal;
  const png = PNG.sync.read(readFileSync(join(process.cwd(), 'public', stageData.mapPath)));
  const cols = Math.ceil(png.width / cell), rows = Math.ceil(png.height / cell);
  const blocked = new Uint8Array(cols * rows), visited = new Uint8Array(cols * rows);
  for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
    const point = { x: (col * cell + cell / 2) * stageData.mapScale, y: (row * cell + cell / 2) * stageData.mapScale };
    blocked[row * cols + col] = Number(touchesTerrain(stage, stageData.mapScale, point, png.data, png.width, png.height));
  }
  const startX = Math.floor(stageData.spawn.x / (cell * stageData.mapScale));
  const startY = Math.floor(stageData.spawn.y / (cell * stageData.mapScale));
  const start = startY * cols + startX;
  const queue = [start];
  if (blocked[start]) { console.error(`L${stage}: spawn is blocked`); failures++; }
  else visited[start] = 1;
  for (let i = 0; i < queue.length; i++) {
    const index = queue[i], x = index % cols, y = Math.floor(index / cols);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy, next = ny * cols + nx;
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows || blocked[next] || visited[next]) continue;
      visited[next] = 1;
      queue.push(next);
    }
  }
  const result = STAGE_MONSTERS[stage].map(({ x: mx, y: my }, i) => {
    let nearest = Infinity;
    for (const index of queue) {
      const x = (index % cols + .5) * cell * stageData.mapScale;
      const y = (Math.floor(index / cols) + .5) * cell * stageData.mapScale;
      nearest = Math.min(nearest, Math.hypot(x - mx, y - my));
    }
    const reachable = nearest <= 100;
    if (!reachable) failures++;
    return `monster ${i + 1}: ${reachable ? 'reachable' : 'BLOCKED'} (${Math.round(nearest)} world px)`;
  });
  for (const [x, y, expected, label] of checks[stage]) {
    const actual = touchesTerrain(stage, stageData.mapScale, { x: x * stageData.mapScale, y: y * stageData.mapScale }, png.data, png.width, png.height);
    if (actual !== expected) failures++;
    result.push(`${label}: ${actual === expected ? 'ok' : 'MISMATCH'} (expected ${expected ? 'solid' : 'walkable'})`);
  }
  if (stage === 1) {
    let crossingBlocked = false;
    for (let segment = 1; segment < lilyPath.length; segment++) {
      const [fromX, fromY] = lilyPath[segment - 1], [toX, toY] = lilyPath[segment];
      const steps = Math.ceil(Math.hypot(toX - fromX, toY - fromY) / 2);
      for (let step = 0; step <= steps; step++) {
        const x = (fromX + (toX - fromX) * step / steps) * stageData.mapScale;
        const y = (fromY + (toY - fromY) * step / steps) * stageData.mapScale;
        if (touchesTerrain(stage, stageData.mapScale, { x, y }, png.data, png.width, png.height)) crossingBlocked = true;
      }
    }
    if (crossingBlocked) failures++;
    result.push(`lily crossing: ${crossingBlocked ? 'BLOCKED' : 'walkable'}`);
  }
  for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
    const index = row * cols + col;
    tint(png, col * cell, row * cell, blocked[index] ? [240, 38, 45] : visited[index] ? [33, 176, 84] : [255, 188, 26], .36);
  }
  const path = join(output, `stage-${stage}.png`);
  writeFileSync(path, PNG.sync.write(png));
  console.log(`L${stage}: ${queue.length}/${cols * rows} cells reachable; ${result.join('; ')}; overlay ${path}`);
}
if (failures) process.exitCode = 1;
