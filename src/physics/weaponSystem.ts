import Matter from 'matter-js';
import { FighterState, WeaponGameState, ActiveMinion, ActiveLetter, ActiveBoomerang, ActiveFlame } from '../types';
import { SCALING, SPHERE_RADIUS } from './constants';
import { getWeaponBehavior, UpdateContext } from './weapons';

export type { WeaponGameState };

const { Bodies, Composite, Body } = Matter;

export interface ActiveStaticObject {
  body: Matter.Body;
  fighterId: string;
  lastFireTime: number;
  createdAt: number;
}

export interface ActiveAOEZone {
  x: number;
  y: number;
  fighterId: string;
  config: {
    radius: number;
    durationMs: number;
    tickIntervalMs: number;
    healingPerTick?: number;
    damagePerTick?: number;
    color: string;
    spawnIntervalMs: number;
  };
  createdAt: number;
  lastTickTime: number;
}

export function createWeaponRuntimeState(): {
  hitCount: number;
  counters: Record<string, number>;
  poisonStacks: Record<string, number>;
  superActive: boolean;
  superReady: boolean;
  superActivatedAt: number;
  lastFireTime: number;
  lastSpecialTime: number;
  parriedTypes: string[];
  copiedAbility: string | null;
  copiedAbilityUses: number;
} {
  return {
    hitCount: 0,
    counters: {},
    poisonStacks: {},
    superActive: false,
    superReady: false,
    superActivatedAt: 0,
    lastFireTime: 0,
    lastSpecialTime: 0,
    parriedTypes: [],
    copiedAbility: null,
    copiedAbilityUses: 0,
  };
}

export function createWeaponGameState(): WeaponGameState {
  return {
    projectiles: [],
    staticObjects: [],
    aoeZones: [],
    fireTimers: new Map(),
    spawnTimers: new Map(),
    minions: [],
    letters: [],
    boomerangs: [],
    flames: [],
  };
}

function findNearestEnemy(
  from: { x: number; y: number },
  fighters: FighterState[],
  ownerFighterId: string,
): FighterState | null {
  let nearest: FighterState | null = null;
  let nearestDist = Infinity;
  for (const f of fighters) {
    if (!f.alive || f.id === ownerFighterId) continue;
    const dx = f.body.position.x - from.x;
    const dy = f.body.position.y - from.y;
    const dist = dx * dx + dy * dy;
    if (dist < nearestDist) {
      nearestDist = dist;
      nearest = f;
    }
  }
  return nearest;
}

function fireTurretProjectiles(
  world: Matter.World,
  turretPos: { x: number; y: number },
  fighterId: string,
  fighters: FighterState[],
  barrels: number,
  damageMultiplier: number,
): Matter.Body[] {
  const projectiles: Matter.Body[] = [];
  const damage = SCALING.wrench.turretDamage * damageMultiplier;

  let target: FighterState | null = null;
  let nearestDist = Infinity;
  for (const f of fighters) {
    if (!f.alive || f.id === fighterId) continue;
    const dx = f.body.position.x - turretPos.x;
    const dy = f.body.position.y - turretPos.y;
    const dist = dx * dx + dy * dy;
    if (dist < nearestDist) { nearestDist = dist; target = f; }
  }

  const baseAngle = target
    ? Math.atan2(target.body.position.y - turretPos.y, target.body.position.x - turretPos.x)
    : Math.random() * Math.PI * 2;

  for (let b = 0; b < barrels; b++) {
    const offset = barrels > 1 ? ((b / (barrels - 1)) - 0.5) * Math.PI / 3 : 0;
    const angle = baseAngle + offset;
    const proj = Bodies.circle(
      turretPos.x + Math.cos(angle) * 15,
      turretPos.y + Math.sin(angle) * 15,
      4,
      {
        restitution: 0.3, friction: 0, density: 0.001, frictionAir: 0.001,
        label: `turret-proj-${fighterId}`,
        plugin: { fighterId, isProjectile: true, damage, color: '#fea801', shape: 'circle' as const, size: { width: 8, height: 8 } },
      },
    );
    Body.setVelocity(proj, { x: Math.cos(angle) * 6, y: Math.sin(angle) * 6 });
    Composite.add(world, proj);
    projectiles.push(proj);
  }
  return projectiles;
}

export function updateStaticObjects(
  world: Matter.World,
  fighters: FighterState[],
  gameState: WeaponGameState,
  now: number,
): void {
  for (const obj of gameState.staticObjects) {
    if (now - obj.createdAt >= SCALING.wrench.turretLifetimeMs) {
      if (Composite.get(world, obj.body.id, 'body')) Composite.remove(world, obj.body);
      continue;
    }
    if (now - obj.lastFireTime >= SCALING.wrench.turretFireMs) {
      const barrels = (obj.body.plugin?.barrels as number) ?? 1;
      const dmgMult = (obj.body.plugin?.damageMultiplier as number) ?? 1;
      const projs = fireTurretProjectiles(world, obj.body.position, obj.fighterId, fighters, barrels, dmgMult);
      if (projs.length > 0) {
        gameState.projectiles.push(...projs);
        obj.lastFireTime = now;
      }
    }
  }
  gameState.staticObjects = gameState.staticObjects.filter((obj: ActiveStaticObject) => {
    if (now - obj.createdAt >= SCALING.wrench.turretLifetimeMs) {
      if (Composite.get(world, obj.body.id, 'body')) Composite.remove(world, obj.body);
      return false;
    }
    return true;
  });
}

export function updateSuperState(fighter: FighterState, now: number): void {
  const ws = fighter.weaponState;
  const behavior = getWeaponBehavior(fighter.weapon);
  if (!behavior) return;
  const def = behavior.def;

  if (!ws.superActive && !ws.superReady && ws.hitCount >= def.superThreshold) {
    ws.superReady = true;
  }
  if (ws.superReady && !ws.superActive) {
    ws.superActive = true;
    ws.superActivatedAt = now;
    ws.superReady = false;
  }
  if (ws.superActive && now - ws.superActivatedAt >= def.superDurationMs) {
    ws.superActive = false;
  }
}

export function updateMinions(
  world: Matter.World,
  fighters: FighterState[],
  gameState: WeaponGameState,
  now: number,
): void {
  const dead: string[] = [];
  for (const minion of gameState.minions) {
    const owner = fighters.find((f) => f.id === minion.fighterId);
    if (!owner || !owner.alive) {
      if (Composite.get(world, minion.body.id, 'body')) Composite.remove(world, minion.body);
      dead.push(minion.body.id.toString());
      continue;
    }
    const target = findNearestEnemy(minion.body.position, fighters, minion.fighterId);
    if (target) {
      const dx = target.body.position.x - minion.body.position.x;
      const dy = target.body.position.y - minion.body.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) {
        const speed = SCALING.grimoire.minionSpeed;
        Body.setVelocity(minion.body, { x: (dx / dist) * speed, y: (dy / dist) * speed });
      }
    }
    if (now - minion.lastAttackTime < 500) continue;
    for (const enemy of fighters) {
      if (!enemy.alive || enemy.id === minion.fighterId) continue;
      const dx = enemy.body.position.x - minion.body.position.x;
      const dy = enemy.body.position.y - minion.body.position.y;
      if (Math.sqrt(dx * dx + dy * dy) < SPHERE_RADIUS + 15) {
        enemy.hp = Math.max(0, enemy.hp - 3 - minion.hitCount * 0.5);
        minion.lastAttackTime = now;
        minion.hitCount++;
        if (enemy.hp <= 0) enemy.alive = false;
        break;
      }
    }
  }
  gameState.minions = gameState.minions.filter((m: ActiveMinion) => !dead.includes(m.body.id.toString()));
}

export function updateLetters(
  world: Matter.World,
  fighters: FighterState[],
  gameState: WeaponGameState,
): void {
  for (const letter of gameState.letters) {
    const owner = fighters.find((f) => f.id === letter.fighterId);
    if (!owner || !owner.alive) {
      if (Composite.get(world, letter.body.id, 'body')) Composite.remove(world, letter.body);
      continue;
    }
    letter.orbitAngle += letter.orbitSpeed * 0.016;
    Body.setPosition(letter.body, {
      x: owner.body.position.x + Math.cos(letter.orbitAngle) * letter.orbitRadius,
      y: owner.body.position.y + Math.sin(letter.orbitAngle) * letter.orbitRadius,
    });
  }
  gameState.letters = gameState.letters.filter((l: ActiveLetter) => {
    const owner = fighters.find((f) => f.id === l.fighterId);
    if (!owner || !owner.alive) {
      if (Composite.get(world, l.body.id, 'body')) Composite.remove(world, l.body);
      return false;
    }
    return true;
  });
}

export function updateBoomerangs(
  world: Matter.World,
  fighters: FighterState[],
  gameState: WeaponGameState,
  now: number,
): void {
  for (const b of gameState.boomerangs) {
    const owner = fighters.find((f) => f.id === b.fighterId);
    if (!owner || !owner.alive) {
      if (Composite.get(world, b.body.id, 'body')) Composite.remove(world, b.body);
      continue;
    }
    if (!b.returning && now >= b.returnAt) b.returning = true;
    if (b.returning) {
      const dx = owner.body.position.x - b.body.position.x;
      const dy = owner.body.position.y - b.body.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < SPHERE_RADIUS) {
        if (Composite.get(world, b.body.id, 'body')) Composite.remove(world, b.body);
        continue;
      }
      Body.setVelocity(b.body, { x: (dx / dist) * 6, y: (dy / dist) * 6 });
    }
  }
  gameState.boomerangs = gameState.boomerangs.filter((b: ActiveBoomerang) => {
    const owner = fighters.find((f) => f.id === b.fighterId);
    if (!owner || !owner.alive) {
      if (Composite.get(world, b.body.id, 'body')) Composite.remove(world, b.body);
      return false;
    }
    if (b.returning) {
      const dx = owner.body.position.x - b.body.position.x;
      const dy = owner.body.position.y - b.body.position.y;
      if (Math.sqrt(dx * dx + dy * dy) < SPHERE_RADIUS) {
        if (Composite.get(world, b.body.id, 'body')) Composite.remove(world, b.body);
        return false;
      }
    }
    return true;
  });
}

export function updateFlames(
  fighters: FighterState[],
  gameState: WeaponGameState,
  now: number,
): void {
  for (const flame of gameState.flames) {
    if (flame.durationMs !== Infinity && now - flame.createdAt >= flame.durationMs) continue;
    if (flame.movesTowardEnemy) {
      const target = findNearestEnemy({ x: flame.x, y: flame.y }, fighters, flame.fighterId);
      if (target) {
        const dx = target.body.position.x - flame.x;
        const dy = target.body.position.y - flame.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 1) { flame.x += (dx / dist) * 0.5; flame.y += (dy / dist) * 0.5; }
      }
    }
    if (now - flame.lastTickTime < 500) continue;
    flame.lastTickTime = now;
    for (const fighter of fighters) {
      if (!fighter.alive) continue;
      if (fighter.id === flame.fighterId || flame.fighterId.includes(fighter.id)) continue;
      const dx = fighter.body.position.x - flame.x;
      const dy = fighter.body.position.y - flame.y;
      if (Math.sqrt(dx * dx + dy * dy) <= flame.radius + SPHERE_RADIUS) {
        fighter.hp = Math.max(0, fighter.hp - flame.dps);
        if (fighter.hp <= 0) fighter.alive = false;
      }
    }
  }
  gameState.flames = gameState.flames.filter((f: ActiveFlame) =>
    f.durationMs === Infinity || f.createdAt + f.durationMs > now,
  );
}

export function updateAllWeapons(
  world: Matter.World,
  engine: Matter.Engine,
  fighters: FighterState[],
  gameState: WeaponGameState,
  now: number,
): void {
  for (const fighter of fighters) {
    if (!fighter.alive) continue;

    updateSuperState(fighter, now);

    const behavior = getWeaponBehavior(fighter.weapon);
    if (!behavior) continue;

    const ctx: UpdateContext = { fighter, world, engine, fighters, gameState, now };
    behavior.onSuperEffect(ctx);
    behavior.onAbilityUpdate(ctx);
  }

  updateStaticObjects(world, fighters, gameState, now);
  updateMinions(world, fighters, gameState, now);
  updateLetters(world, fighters, gameState);
  updateBoomerangs(world, fighters, gameState, now);
  updateFlames(fighters, gameState, now);
}

export function tickDOTs(fighters: FighterState[], now: number): string[] {
  const deadFighterIds: string[] = [];
  for (const fighter of fighters) {
    if (!fighter.alive) continue;
    fighter.activeDOTs = fighter.activeDOTs.filter((dot) => {
      if (dot.maxTicks !== undefined && dot.tickCount !== undefined && dot.tickCount >= dot.maxTicks) return false;
      if (now >= dot.expiresAt) return false;
      if (now - dot.lastTickTime >= dot.tickIntervalMs) {
        dot.lastTickTime = now;
        if (dot.tickCount !== undefined) dot.tickCount++;
        fighter.hp = Math.max(0, fighter.hp - dot.damagePerTick);
        if (fighter.hp <= 0) { fighter.alive = false; deadFighterIds.push(fighter.id); }
      }
      return true;
    });
  }
  return deadFighterIds;
}

export function cleanupProjectiles(world: Matter.World, gameState: WeaponGameState): void {
  gameState.projectiles = gameState.projectiles.filter((proj: Matter.Body) =>
    Composite.get(world, proj.id, 'body') !== null,
  );
}
