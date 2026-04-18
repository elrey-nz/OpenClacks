/**
 * Shield — wide rectangle/arc in front of the ball. Passive weapon.
 *
 * Mechanic: Parries incoming projectiles/weapon hits (no damage taken, projectile destroyed).
 *           Each parry increases shield width by +5%.
 *           Parrying a unique weapon type temporarily copies a weaker version of that ability.
 * Super:    Shield can be thrown like a boomerang — detaches, spins, returns after a short time.
 *           Reduced frontal defense while shield is thrown.
 */
import { WeaponBehavior, WeaponDef, HitContext, DEFAULT_DEF, incrementCounter } from './WeaponBase';

const DEF: WeaponDef = {
  id: 'shield',
  label: 'Shield',
  color: '#b58101',
  ...DEFAULT_DEF,
  behavior: 'passive',
  bodyWidth: 40,
  bodyHeight: 50,
  bodyDensity: 0.02,
  bodyStiffness: 0.95,
  baseDamage: 2,
  canParry: true,
};

const WIDTH_PERCENT_PER_HIT = 5;

export class ShieldBehavior extends WeaponBehavior {
  readonly id = 'shield';
  readonly def = DEF;

  calculateDamage(): number {
    return DEF.baseDamage;
  }

  onHitScaling(ctx: HitContext): void {
    this.onHit(ctx.attacker.weaponState);
    incrementCounter(ctx.attacker.weaponState, 'shieldWidth', WIDTH_PERCENT_PER_HIT);
  }
}
