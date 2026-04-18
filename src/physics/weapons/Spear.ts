/**
 * Spear — long, thin rectangle attached near the ball's center.
 *
 * Mechanic: Each hit increases length by +0.5 and damage by +0.5.
 * Super:    Centered through the ball (attacks with both ends), 1.5x rotation speed.
 */
import { WeaponBehavior, WeaponDef, HitContext, DEFAULT_DEF, incrementCounter } from './WeaponBase';

const DEF: WeaponDef = {
  id: 'spear',
  label: 'Spear',
  color: '#00feff',
  ...DEFAULT_DEF,
  bodyWidth: 100,
  bodyHeight: 4,
  bodyDensity: 0.001,
  baseDamage: 8,
};

const SIZE_PER_HIT = 0.5;
const DAMAGE_PER_HIT = 0.5;

export class SpearBehavior extends WeaponBehavior {
  readonly id = 'spear';
  readonly def = DEF;

  calculateDamage(ctx: HitContext): number {
    return DEF.baseDamage + this.getCounter(ctx.attacker.weaponState, 'damageBonus');
  }

  onHitScaling(ctx: HitContext): void {
    this.onHit(ctx.attacker.weaponState);
    incrementCounter(ctx.attacker.weaponState, 'damageBonus', DAMAGE_PER_HIT);
    incrementCounter(ctx.attacker.weaponState, 'sizeBonus', SIZE_PER_HIT);
  }
}
