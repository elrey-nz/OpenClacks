/**
 * Unarmed — no weapon body; only the ball itself.
 *
 * Mechanic: Each hit increases max speed by +1.
 *           Damage = baseDamage + speedFactor * speed at impact.
 * Super:    Ignores gravity and friction/damping — maintains momentum indefinitely.
 */
import { WeaponBehavior, WeaponDef, HitContext, UpdateContext, NO_BODY_WEAPON, incrementCounter } from './WeaponBase';
import Matter from 'matter-js';

const DEF: WeaponDef = {
  id: 'unarmed',
  label: 'Unarmed',
  color: '#cfcfcf',
  behavior: 'melee',
  ...NO_BODY_WEAPON,
  baseDamage: 5,
  damageType: 'speed_scaled',
  superEnabled: true,
  superThreshold: 5,
  superDurationMs: 6000,
};

const SPEED_PER_HIT = 1;
const SPEED_DAMAGE_FACTOR = 0.5;

export class UnarmedBehavior extends WeaponBehavior {
  readonly id = 'unarmed';
  readonly def = DEF;

  calculateDamage(ctx: HitContext): number {
    const speed = Math.sqrt(
      ctx.attacker.body.velocity.x ** 2 + ctx.attacker.body.velocity.y ** 2,
    );
    const speedBonus = this.getCounter(ctx.attacker.weaponState, 'speedBonus');
    return DEF.baseDamage + SPEED_DAMAGE_FACTOR * (speed + speedBonus);
  }

  onHitScaling(ctx: HitContext): void {
    this.onHit(ctx.attacker.weaponState);
    incrementCounter(ctx.attacker.weaponState, 'speedBonus', SPEED_PER_HIT);
  }

  onSuperEffect(ctx: UpdateContext): void {
    if (ctx.fighter.weaponState.superActive) {
      Matter.Body.set(ctx.fighter.body, { frictionAir: 0, friction: 0 });
    }
  }
}
