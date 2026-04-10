import Matter from 'matter-js';
import { FighterState, WeaponGameState } from '../types';
import {
  VELOCITY_DAMAGE_MULTIPLIER,
  BASE_COLLISION_DAMAGE,
  DAMAGE_VELOCITY_THRESHOLD,
  ARENA_HEIGHT,
  MIN_WALL_BOUNCE_SPEED,
  SCALING,
} from './constants';
import { removeFighter } from './entities';
import { getWeaponBehavior, HitContext, makeDummyGameState } from './weapons';
import { handleShurikenBounce, removeBodySafe } from './weapons/WeaponUtils';

const { Vector } = Matter;

function ensureMinBounceSpeed(fighterBody: Matter.Body, wallBody: Matter.Body, minSpeed: number) {
  const vel = fighterBody.velocity;
  const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
  if (speed >= minSpeed) return;
  const dx = fighterBody.position.x - wallBody.position.x;
  const dy = fighterBody.position.y - wallBody.position.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const nx = dist > 0.001 ? dx / dist : 0;
  const ny = dist > 0.001 ? dy / dist : -1;
  Matter.Body.setVelocity(fighterBody, { x: nx * minSpeed, y: ny * minSpeed });
}

export interface CollisionResult {
  updatedFighters: FighterState[];
  deadFighterIds: string[];
}

export function handleCollisions(
  engine: Matter.Engine,
  fighters: FighterState[],
  world: Matter.World,
  gameState: WeaponGameState,
): CollisionResult {
  const deadFighterIds: string[] = [];
  const fighterMap = new Map<string, FighterState>();
  for (const f of fighters) fighterMap.set(f.id, f);

  Matter.Events.on(engine, 'collisionStart', (event) => {
    const now = performance.now();
    for (const pair of event.pairs) {
      const { bodyA, bodyB } = pair;
      const fIdA = bodyA.plugin?.fighterId as string | undefined;
      const fIdB = bodyB.plugin?.fighterId as string | undefined;
      if (!fIdA && !fIdB) continue;

      const isWeapA = bodyA.plugin?.isWeapon === true;
      const isWeapB = bodyB.plugin?.isWeapon === true;
      const isProjA = bodyA.plugin?.isProjectile === true;
      const isProjB = bodyB.plugin?.isProjectile === true;
      const isStatA = bodyA.plugin?.isStaticObject === true;
      const isStatB = bodyB.plugin?.isStaticObject === true;
      const isMinA = bodyA.plugin?.isMinion === true;
      const isMinB = bodyB.plugin?.isMinion === true;
      const isWallA = bodyA.label === 'wall';
      const isWallB = bodyB.label === 'wall';

      if (isWallA || isWallB) {
        wallCollision(bodyA, bodyB, fIdA, fIdB, isProjA, isProjB, isWeapA, isWeapB, isStatA, isStatB, isMinA, isMinB, fighterMap, world, gameState, now);
        continue;
      }

      if (isMinA && isMinB) continue;

      if (isMinA && !isProjB && fIdA && fIdB && fIdA !== fIdB) {
        minionHit(bodyA, fIdA, fIdB, fighterMap, world, deadFighterIds, gameState, now);
        continue;
      }
      if (isMinB && !isProjA && fIdA && fIdB && fIdA !== fIdB) {
        minionHit(bodyB, fIdB, fIdA, fighterMap, world, deadFighterIds, gameState, now);
        continue;
      }

      if ((isStatA || isStatB) && !isProjA && !isProjB) continue;
      if (isProjA && isProjB) continue;
      if (isProjA && (isWeapB || isStatB || isMinB)) continue;
      if (isProjB && (isWeapA || isStatA || isMinA)) continue;
      if (isWeapA && isWeapB && fIdA !== fIdB) continue;

      if (isProjA && fIdB && !isWeapB && !isStatB && !isMinB) {
        projectileHit(bodyA, bodyB, fIdA!, fIdB!, fighterMap, world, deadFighterIds, now);
        continue;
      }
      if (isProjB && fIdA && !isWeapA && !isStatA && !isMinA) {
        projectileHit(bodyB, bodyA, fIdB!, fIdA!, fighterMap, world, deadFighterIds, now);
        continue;
      }

      if (fIdA && fIdB && fIdA !== fIdB && !isProjA && !isProjB && !isStatA && !isStatB && !isMinA && !isMinB) {
        fighterCollision(bodyA, bodyB, fIdA, fIdB, isWeapA, isWeapB, fighterMap, world, deadFighterIds, now);
      }
    }
  });

  return { updatedFighters: Array.from(fighterMap.values()), deadFighterIds };
}

function wallCollision(
  bodyA: Matter.Body, bodyB: Matter.Body,
  fIdA: string | undefined, fIdB: string | undefined,
  isProjA: boolean, isProjB: boolean,
  isWeapA: boolean, isWeapB: boolean,
  isStatA: boolean, isStatB: boolean,
  isMinA: boolean, isMinB: boolean,
  fighterMap: Map<string, FighterState>,
  world: Matter.World,
  gameState: WeaponGameState,
  now: number,
): void {
  if (isProjA) { projWallHit(bodyA, fIdA, world, gameState, now); return; }
  if (isProjB) { projWallHit(bodyB, fIdB, world, gameState, now); return; }
  if (isMinA || isMinB || isStatA || isStatB) return;

  for (const [fId, body, isWeap] of [[fIdB, bodyB, isWeapB], [fIdA, bodyA, isWeapA]] as const) {
    if (fId && !isWeap) {
      const f = fighterMap.get(fId);
      if (f?.alive && body.position.y > ARENA_HEIGHT - 50 && body.velocity.y > 0) {
        Matter.Body.setVelocity(body, { x: body.velocity.x, y: -body.velocity.y * 1.15 });
      }
    }
  }

  if (bodyA.label === 'wall' && fIdB && !isProjB && !isWeapB) ensureMinBounceSpeed(bodyB, bodyA, MIN_WALL_BOUNCE_SPEED);
  if (bodyB.label === 'wall' && fIdA && !isProjA && !isWeapA) ensureMinBounceSpeed(bodyA, bodyB, MIN_WALL_BOUNCE_SPEED);
}

function projWallHit(body: Matter.Body, fId: string | undefined, world: Matter.World, gameState: WeaponGameState, now: number): void {
  if (body.plugin?.shuriken) {
    if (!handleShurikenBounce(body)) removeBodySafe(world, body);
    return;
  }
  if (body.plugin?.flask && fId) {
    const spillDPS = (body.plugin?.spillDPS as number) ?? 3;
    gameState.aoeZones.push({
      x: body.position.x, y: body.position.y, fighterId: fId,
      config: { radius: SCALING.flask.spillRadius, durationMs: SCALING.flask.spillDurationMs, tickIntervalMs: 500, damagePerTick: spillDPS, color: 'rgba(0, 154, 4, 0.3)', spawnIntervalMs: 0 },
      createdAt: now, lastTickTime: now,
    });
  }
  removeBodySafe(world, body);
}

function minionHit(
  mBody: Matter.Body, _ownerId: string, targetId: string,
  fighterMap: Map<string, FighterState>, world: Matter.World,
  deadIds: string[], gameState: WeaponGameState, now: number,
): void {
  const enemy = fighterMap.get(targetId);
  if (!enemy?.alive) return;
  const minion = gameState.minions.find((m) => m.body === mBody);
  if (minion && now - minion.lastAttackTime >= 500) {
    const dmg = 3 + minion.hitCount * 0.5;
    enemy.hp = Math.max(0, enemy.hp - dmg);
    minion.lastAttackTime = now;
    minion.hitCount++;
    if (enemy.hp <= 0) { enemy.alive = false; deadIds.push(enemy.id); removeFighter(world, enemy); }
  }
}

function projectileHit(
  projBody: Matter.Body, targetBody: Matter.Body,
  atkId: string, defId: string,
  fighterMap: Map<string, FighterState>, world: Matter.World,
  deadIds: string[], _now: number,
): void {
  const attacker = fighterMap.get(atkId);
  const defender = fighterMap.get(defId);
  if (!attacker || !defender || attacker.id === defender.id || !defender.alive) return;

  const behavior = getWeaponBehavior(defender.weapon);
  if (behavior?.def.canParry && defender.weaponBody) {
    const dx = targetBody.position.x - defender.weaponBody.position.x;
    const dy = targetBody.position.y - defender.weaponBody.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const shieldWidth = behavior.def.bodyWidth * (1 + (defender.weaponState.counters['shieldWidth'] ?? 0) / 100);
    if (dist < shieldWidth / 2 + 20) {
      Matter.Body.setVelocity(projBody, { x: -projBody.velocity.x * 0.5, y: -projBody.velocity.y * 0.5 });
      Matter.Body.setAngle(projBody, Math.atan2(projBody.velocity.y, projBody.velocity.x));
      defender.weaponState.hitCount++;
      defender.weaponState.counters['shieldWidth'] = (defender.weaponState.counters['shieldWidth'] ?? 0) + SCALING.shield.widthPercentPerHit;
      return;
    }
  }

  const damage = (projBody.plugin?.damage as number) ?? 10;
  defender.hp = Math.max(0, defender.hp - damage);
  if (defender.hp <= 0) { defender.alive = false; deadIds.push(defender.id); removeFighter(world, defender); }
  removeBodySafe(world, projBody);
}

function fighterCollision(
  bodyA: Matter.Body, bodyB: Matter.Body,
  fIdA: string, fIdB: string,
  isWeapA: boolean, isWeapB: boolean,
  fighterMap: Map<string, FighterState>, world: Matter.World,
  deadIds: string[], now: number,
): void {
  const fA = fighterMap.get(fIdA);
  const fB = fighterMap.get(fIdB);
  if (!fA || !fB || !fA.alive || !fB.alive) return;

  const relVel = Vector.sub({ x: bodyA.velocity.x, y: bodyA.velocity.y }, { x: bodyB.velocity.x, y: bodyB.velocity.y });
  const relSpeed = Vector.magnitude(relVel);
  if (relSpeed < DAMAGE_VELOCITY_THRESHOLD) return;

  const allFighters = Array.from(fighterMap.values());
  const baseDmg = BASE_COLLISION_DAMAGE + relSpeed * VELOCITY_DAMAGE_MULTIPLIER;

  const behaviorA = getWeaponBehavior(fA.weapon);
  const behaviorB = getWeaponBehavior(fB.weapon);
  const defA = behaviorA?.def;
  const defB = behaviorB?.def;

  if (isWeapA && !isWeapB && behaviorA) {
    const hitCtx: HitContext = { attacker: fA, defender: fB, baseDamage: baseDmg, isWeaponHit: true, world, gameState: makeDummyGameState(), fighters: allFighters, now, deadFighterIds: deadIds };
    const dmg = behaviorA.calculateDamage(hitCtx);
    behaviorA.onHitScaling(hitCtx);
    if (!defB?.canParry) { fB.hp = Math.max(0, fB.hp - dmg); if (fB.hp <= 0) { fB.alive = false; deadIds.push(fB.id); removeFighter(world, fB); } }
    if (!defA?.canParry) { fA.hp = Math.max(0, fA.hp - baseDmg * 0.3); if (fA.hp <= 0) { fA.alive = false; deadIds.push(fA.id); removeFighter(world, fA); } }
    return;
  }

  if (isWeapB && !isWeapA && behaviorB) {
    const hitCtx: HitContext = { attacker: fB, defender: fA, baseDamage: baseDmg, isWeaponHit: true, world, gameState: makeDummyGameState(), fighters: allFighters, now, deadFighterIds: deadIds };
    const dmg = behaviorB.calculateDamage(hitCtx);
    behaviorB.onHitScaling(hitCtx);
    if (!defA?.canParry) { fA.hp = Math.max(0, fA.hp - dmg); if (fA.hp <= 0) { fA.alive = false; deadIds.push(fA.id); removeFighter(world, fA); } }
    if (!defB?.canParry) { fB.hp = Math.max(0, fB.hp - baseDmg * 0.3); if (fB.hp <= 0) { fB.alive = false; deadIds.push(fB.id); removeFighter(world, fB); } }
    return;
  }

  {
    const dmgAToB = behaviorA ? behaviorA.calculateDamage({ attacker: fA, defender: fB, baseDamage: baseDmg, isWeaponHit: false, world, gameState: makeDummyGameState(), fighters: allFighters, now, deadFighterIds: deadIds }) : baseDmg;
    behaviorA?.onHitScaling({ attacker: fA, defender: fB, baseDamage: baseDmg, isWeaponHit: false, world, gameState: makeDummyGameState(), fighters: allFighters, now, deadFighterIds: deadIds });

    const dmgBToA = behaviorB ? behaviorB.calculateDamage({ attacker: fB, defender: fA, baseDamage: baseDmg, isWeaponHit: false, world, gameState: makeDummyGameState(), fighters: allFighters, now, deadFighterIds: deadIds }) : baseDmg;
    behaviorB?.onHitScaling({ attacker: fB, defender: fA, baseDamage: baseDmg, isWeaponHit: false, world, gameState: makeDummyGameState(), fighters: allFighters, now, deadFighterIds: deadIds });

    if (!defA?.canParry) { fA.hp = Math.max(0, fA.hp - dmgBToA); if (fA.hp <= 0) { fA.alive = false; deadIds.push(fA.id); removeFighter(world, fA); } }
    if (!defB?.canParry) { fB.hp = Math.max(0, fB.hp - dmgAToB); if (fB.hp <= 0) { fB.alive = false; deadIds.push(fB.id); removeFighter(world, fB); } }
  }
}

export function cleanupCollisionHandler(engine: Matter.Engine): void {
  Matter.Events.off(engine, 'collisionStart');
}
