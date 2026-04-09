import Matter from 'matter-js';
import { FighterState } from '../types';
import {
  VELOCITY_DAMAGE_MULTIPLIER,
  BASE_COLLISION_DAMAGE,
  DAMAGE_VELOCITY_THRESHOLD,
  BOUNCE_BOOST,
  ARENA_HEIGHT,
  ARENA_WIDTH,
} from './constants';
import { removeFighter } from './entities';

const { Vector } = Matter;


export interface CollisionResult {
  updatedFighters: FighterState[];
  deadFighterIds: string[];
}

export function handleCollisions(
  engine: Matter.Engine,
  fighters: FighterState[],
  world: Matter.World,
): CollisionResult {
  const deadFighterIds: string[] = [];
  const fighterMap = new Map<string, FighterState>();
  for (const f of fighters) {
    fighterMap.set(f.id, f);
  }

  Matter.Events.on(engine, 'collisionStart', (event) => {
    for (const pair of event.pairs) {
      const { bodyA, bodyB } = pair;

      const fighterIdA = bodyA.plugin?.fighterId as string | undefined;
      const fighterIdB = bodyB.plugin?.fighterId as string | undefined;

      if (!fighterIdA && !fighterIdB) continue;

      const isWeaponA = bodyA.plugin?.isWeapon === true;
      const isWeaponB = bodyB.plugin?.isWeapon === true;
      const isArrowA = bodyA.plugin?.isArrow === true;
      const isArrowB = bodyB.plugin?.isArrow === true;
      const isWallA = bodyA.label === 'wall';
      const isWallB = bodyB.label === 'wall';

      if (isWallA || isWallB) {
        // Bottom wall trampoline - reflect and boost velocity
        if (isWallA && fighterIdB && !isArrowB && !isWeaponB) {
          const fighter = fighterMap.get(fighterIdB);
          if (fighter && fighter.alive && bodyB.position.y > ARENA_HEIGHT - 50) {
            const vel = bodyB.velocity;
            if (vel.y > 0) {
              // Reflect upward with 15% boost
              Matter.Body.setVelocity(bodyB, { x: vel.x, y: -vel.y * 1.15 });
            }
          }
        }
        if (isWallB && fighterIdA && !isArrowA && !isWeaponA) {
          const fighter = fighterMap.get(fighterIdA);
          if (fighter && fighter.alive && bodyA.position.y > ARENA_HEIGHT - 50) {
            const vel = bodyA.velocity;
            if (vel.y > 0) {
              // Reflect upward with 15% boost
              Matter.Body.setVelocity(bodyA, { x: vel.x, y: -vel.y * 1.15 });
            }
          }
        }
        if (isArrowA) {
          Matter.Composite.remove(world, bodyA);
        }
        if (isArrowB) {
          Matter.Composite.remove(world, bodyB);
        }
        continue;
      }

      if (isArrowA && isArrowB) continue;

      // Skip arrow-weapon collisions (arrows should only hit fighter bodies)
      if (isArrowA && isWeaponB) continue;
      if (isArrowB && isWeaponA) continue;

      if (isArrowA && fighterIdB) {
        const attacker = fighterMap.get(fighterIdA);
        const defender = fighterMap.get(fighterIdB);
        if (attacker && defender && attacker.id !== defender.id && defender.alive) {
          const damage = 15;
          defender.hp = Math.max(0, defender.hp - damage);
          if (defender.hp <= 0) {
            defender.alive = false;
            deadFighterIds.push(defender.id);
            removeFighter(world, defender);
          }
          Matter.Composite.remove(world, bodyA);
        }
        continue;
      }

      if (isArrowB && fighterIdA) {
        const attacker = fighterMap.get(fighterIdB);
        const defender = fighterMap.get(fighterIdA);
        if (attacker && defender && attacker.id !== defender.id && defender.alive) {
          const damage = 15;
          defender.hp = Math.max(0, defender.hp - damage);
          if (defender.hp <= 0) {
            defender.alive = false;
            deadFighterIds.push(defender.id);
            removeFighter(world, defender);
          }
          Matter.Composite.remove(world, bodyB);
        }
        continue;
      }

      if (fighterIdA && fighterIdB && fighterIdA !== fighterIdB) {
        const fighterA = fighterMap.get(fighterIdA);
        const fighterB = fighterMap.get(fighterIdB);

        if (!fighterA || !fighterB) continue;
        if (!fighterA.alive || !fighterB.alive) continue;

        const relVel = Vector.sub(
          { x: bodyA.velocity.x, y: bodyA.velocity.y },
          { x: bodyB.velocity.x, y: bodyB.velocity.y },
        );
        const relSpeed = Vector.magnitude(relVel);

        if (relSpeed < DAMAGE_VELOCITY_THRESHOLD) continue;

        const isHitOnBodyA = !isWeaponA;
        const isHitOnBodyB = !isWeaponB;

        let damage = BASE_COLLISION_DAMAGE + relSpeed * VELOCITY_DAMAGE_MULTIPLIER;

        const weaponTypeA = bodyA.plugin?.weaponType as string | undefined;
        const weaponTypeB = bodyB.plugin?.weaponType as string | undefined;

        if (weaponTypeA === 'sword' && isHitOnBodyB) damage *= 1.5;
        if (weaponTypeB === 'sword' && isHitOnBodyA) damage *= 1.5;
        if (weaponTypeA === 'shield') damage *= 0.5;
        if (weaponTypeB === 'shield') damage *= 0.5;

        if (isHitOnBodyA && fighterA.weapon !== 'shield') {
          fighterA.hp = Math.max(0, fighterA.hp - damage);
          if (fighterA.hp <= 0) {
            fighterA.alive = false;
            deadFighterIds.push(fighterA.id);
            removeFighter(world, fighterA);
          }
        }

        if (isHitOnBodyB && fighterB.weapon !== 'shield') {
          fighterB.hp = Math.max(0, fighterB.hp - damage);
          if (fighterB.hp <= 0) {
            fighterB.alive = false;
            deadFighterIds.push(fighterB.id);
            removeFighter(world, fighterB);
          }
        }
      }
    }
  });

  return {
    updatedFighters: Array.from(fighterMap.values()),
    deadFighterIds,
  };
}

export function cleanupCollisionHandler(engine: Matter.Engine): void {
  Matter.Events.off(engine, 'collisionStart');
}
