/**
 * Flail — heavy ball on a short chain, attached via a constraint.
 *
 * Mechanic: Swings unpredictably as the ball moves. Each hit increases size and damage by +0.5.
 * Super:    Not yet defined. Stub in place for future supers.
 */
import { WeaponBehavior, WeaponDef, HitContext, DEFAULT_DEF, incrementCounter } from './WeaponBase';

const DEF: WeaponDef = {
  id: 'flail',
  label: 'Flail',
  color: '#e2947c',
  ...DEFAULT_DEF,
  bodyShape: 'circle',
  bodyWidth: 30,
  bodyHeight: 30,
  bodyDensity: 0.006,
  bodyStiffness: 0.5,
  baseDamage: 10,
  superEnabled: false,
  superThreshold: Infinity,
  superDurationMs: 0,
};

const SIZE_PER_HIT = 0.5;
const DAMAGE_PER_HIT = 0.5;

export class FlailBehavior extends WeaponBehavior {
  readonly id = 'flail';
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
