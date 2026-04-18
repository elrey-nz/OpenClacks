/**
 * Bow — static bow shape (visual only), fires arrow projectiles.
 *
 * Mechanic: Starts with arrowCount=1. Each hit increments arrowCount by +1.
 *           Periodically shoots arrowCount arrows toward opponents in a spread arc.
 * Super:    Each burst fires 2x arrows at different angles.
 */
import { WeaponBehavior, WeaponDef, UpdateContext, DEFAULT_DEF, incrementCounter } from './WeaponBase';
import { angleToNearest, createProjectileBody } from './WeaponUtils';
import { WEAPON_CONSTANTS, SPHERE_RADIUS } from '../constants';

const DEF: WeaponDef = {
  id: 'bow',
  label: 'Bow',
  color: '#ffff02',
  ...DEFAULT_DEF,
  behavior: 'ranged',
  bodyWidth: 40,
  bodyHeight: 8,
  bodyDensity: 0.001,
  bodyIsSensor: true,
  baseDamage: 0,
};

const ARROW_COUNT_PER_HIT = 1;

export class BowBehavior extends WeaponBehavior {
  readonly id = 'bow';
  readonly def = DEF;

  calculateDamage(): number {
    return 0;
  }

  onHitScaling(ctx: Parameters<WeaponBehavior['onHitScaling']>[0]): void {
    this.onHit(ctx.attacker.weaponState);
    incrementCounter(ctx.attacker.weaponState, 'arrowCount', ARROW_COUNT_PER_HIT);
  }

  onAbilityUpdate(ctx: UpdateContext): void {
    const wc = WEAPON_CONSTANTS.bow;
    const ws = ctx.fighter.weaponState;
    if (ctx.now - ws.lastFireTime < wc.projectileIntervalMs) return;

    const count = (ws.counters['arrowCount'] ?? 1);
    const multiplier = ws.superActive ? 2 : 1;
    const totalArrows = count * multiplier;
    const baseAngle = angleToNearest(ctx.fighter.body.position, ctx.fighters, ctx.fighter.id);
    const spread = Math.PI / 6;

    for (let i = 0; i < totalArrows; i++) {
      const offset = totalArrows > 1 ? (i / (totalArrows - 1) - 0.5) * spread * 2 : 0;
      const angle = baseAngle + offset;
      const dist = SPHERE_RADIUS + 20;
      createProjectileBody(
        ctx.world,
        ctx.fighter.body.position.x + Math.cos(angle) * dist,
        ctx.fighter.body.position.y + Math.sin(angle) * dist,
        wc.projectileWidth, wc.projectileHeight, angle, wc.projectileSpeed,
        ctx.fighter.id, wc.projectileDamage, '#ffff02', { arrow: true },
      );
      ctx.gameState.projectiles.push(
        ctx.gameState.projectiles[ctx.gameState.projectiles.length - 1] ||
        Matter.Composite.allBodies(ctx.world).find(b => b.label === `projectile-${ctx.fighter.id}`)!,
      );
    }
    ws.lastFireTime = ctx.now;
  }
}

import Matter from 'matter-js';
