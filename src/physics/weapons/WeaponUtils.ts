import Matter from 'matter-js';
import { FighterState, WeaponGameState } from '../../types';
import { SPHERE_RADIUS } from '../constants';

const { Bodies, Composite, Body } = Matter;

export function findNearestEnemy(
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

export function angleToNearest(
  from: { x: number; y: number },
  fighters: FighterState[],
  ownerId: string,
): number {
  const target = findNearestEnemy(from, fighters, ownerId);
  if (target) {
    return Math.atan2(target.body.position.y - from.y, target.body.position.x - from.x);
  }
  return Math.random() * Math.PI * 2;
}

export function createProjectileBody(
  world: Matter.World,
  x: number,
  y: number,
  width: number,
  height: number,
  angle: number,
  speed: number,
  fighterId: string,
  damage: number,
  color: string,
  extra: Record<string, unknown> = {},
  shape: 'rectangle' | 'circle' = 'rectangle',
): Matter.Body {
  const proj = shape === 'circle'
    ? Bodies.circle(x, y, width / 2, {
        restitution: 0.3,
        friction: 0,
        density: 0.001,
        frictionAir: 0.005,
        label: `projectile-${fighterId}`,
        plugin: { fighterId, isProjectile: true, damage, color, shape, size: { width, height }, ...extra },
      })
    : Bodies.rectangle(x, y, width, height, {
        restitution: 0.3,
        friction: 0,
        density: 0.001,
        frictionAir: 0.005,
        angle,
        label: `projectile-${fighterId}`,
        plugin: { fighterId, isProjectile: true, damage, color, shape, size: { width, height }, ...extra },
      });

  Body.setVelocity(proj, { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed });
  Composite.add(world, proj);
  return proj;
}

export function spawnTurret(
  world: Matter.World,
  gameState: WeaponGameState,
  fighterId: string,
  x: number,
  y: number,
  now: number,
  barrels: number,
  damageMultiplier: number,
): void {
  const body = Bodies.circle(
    Math.max(30, Math.min(700 - 30, x)),
    Math.max(30, Math.min(700 - 30, y)),
    15,
    {
      isStatic: true,
      isSensor: true,
      label: `turret-${fighterId}`,
      plugin: { fighterId, isStaticObject: true, barrels, damageMultiplier },
    },
  );
  Composite.add(world, body);
  gameState.staticObjects.push({ body, fighterId, lastFireTime: 0, createdAt: now });
}

export function spawnMinion(
  world: Matter.World,
  gameState: WeaponGameState,
  attacker: FighterState,
  targetWeapon: string,
  now: number,
  isSuper: boolean,
  minionHp: number,
): void {
  const pos = attacker.body.position;
  const angle = Math.random() * Math.PI * 2;
  const dist = SPHERE_RADIUS + 30;
  const mBody = Bodies.circle(
    pos.x + Math.cos(angle) * dist,
    pos.y + Math.sin(angle) * dist,
    isSuper ? 8 : 12,
    {
      restitution: 0.5,
      friction: 0,
      density: 0.001,
      frictionAir: 0.01,
      label: `minion-${attacker.id}-${Date.now()}`,
      plugin: { fighterId: attacker.id, isMinion: true, minionId: `minion-${attacker.id}-${gameState.minions.length}` },
    },
  );
  Composite.add(world, mBody);
  gameState.minions.push({
    body: mBody,
    fighterId: attacker.id,
    hp: isSuper ? Infinity : minionHp,
    maxHp: minionHp,
    copiedWeapon: targetWeapon,
    hitCount: 0,
    invincible: isSuper,
    createdAt: now,
    lastAttackTime: 0,
  });
}

export function spawnFlame(
  gameState: WeaponGameState,
  fighterId: string,
  x: number,
  y: number,
  now: number,
  dps: number,
  durationMs: number,
  radius: number,
  movesTowardEnemy: boolean,
): void {
  gameState.flames.push({
    x, y,
    fighterId,
    createdAt: now,
    lifetime: durationMs,
    dps,
    radius,
    movesTowardEnemy,
    lastTickTime: now,
    durationMs,
  });
}

export function spawnHealingBox(
  gameState: WeaponGameState,
  fighterId: string,
  x: number,
  y: number,
  now: number,
  dps: number,
  durationMs: number,
): void {
  gameState.flames.push({
    x, y,
    fighterId: `scepter_${fighterId}`,
    createdAt: now,
    lifetime: durationMs,
    dps,
    radius: 40,
    movesTowardEnemy: false,
    lastTickTime: now,
    durationMs,
  });
}

export function addDotToTarget(
  defender: FighterState,
  effectName: string,
  tickDamage: number,
  tickIntervalMs: number,
  maxTicks: number,
  now: number,
  sourceFighterId: string,
): void {
  defender.activeDOTs.push({
    effectName,
    damagePerTick: tickDamage,
    tickIntervalMs,
    startedAt: now,
    lastTickTime: now,
    expiresAt: now + tickIntervalMs * maxTicks,
    tickCount: 0,
    maxTicks,
    sourceFighterId,
  });
}

export function handleShurikenBounce(body: Matter.Body): boolean {
  const bouncesLeft = body.plugin?.bouncesLeft as number | undefined;
  if (bouncesLeft === undefined || bouncesLeft <= 0) return false;
  const currentBounces = (body.plugin?.bounceCount as number) ?? 0;
  body.plugin.bouncesLeft = bouncesLeft - 1;
  body.plugin.bounceCount = currentBounces + 1;
  const vel = body.velocity;
  Body.setVelocity(body, { x: -vel.x, y: -vel.y });
  return true;
}

export function removeBodySafe(world: Matter.World, body: Matter.Body): void {
  if (Composite.get(world, body.id, 'body')) {
    Composite.remove(world, body);
  }
}
