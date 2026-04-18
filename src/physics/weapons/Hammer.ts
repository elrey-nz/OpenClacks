/**
 * Hammer — large heavy rectangle attached to the ball.
 *
 * Mechanic: Each hit increases max rotation speed by +1. Damage scales with
 *           rotation speed at impact. The hammer accelerates toward max rotation
 *           and does not change direction when parrying.
 * Super:    Rotation speed no longer resets after dealing damage; continuously
 *           accelerates until it hits a maximum.
 */
import { WeaponBehavior, WeaponDef, HitContext, DEFAULT_DEF, incrementCounter } from './WeaponBase';

const DEF: WeaponDef = {
  id: 'hammer',
  label: 'Hammer',
  color: '#d24e86',
  ...DEFAULT_DEF,
  bodyWidth: 50,
  bodyHeight: 20,
  bodyDensity: 0.008,
  baseDamage: 12,
  damageType: 'rotation_scaled',
};

const ROTATION_PER_HIT = 1;
const MAX_ROTATION = 20;
const DAMAGE_PER_ROTATION = 1;

export class HammerBehavior extends WeaponBehavior {
  readonly id = 'hammer';
  readonly def = DEF;

  calculateDamage(ctx: HitContext): number {
    const rotSpeed = Math.abs(ctx.attacker.body.angularVelocity);
    const rotBonus = this.getCounter(ctx.attacker.weaponState, 'rotationSpeed');
    return DEF.baseDamage + DAMAGE_PER_ROTATION * (rotSpeed + rotBonus);
  }

  onHitScaling(ctx: HitContext): void {
    this.onHit(ctx.attacker.weaponState);
    incrementCounter(ctx.attacker.weaponState, 'rotationSpeed', ROTATION_PER_HIT, MAX_ROTATION);
  }
}
