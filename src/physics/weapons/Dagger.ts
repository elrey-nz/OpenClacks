import { WeaponBehavior, WeaponDef, HitContext, DEFAULT_DEF, incrementCounter } from './WeaponBase';

const DEF: WeaponDef = {
  id: 'dagger',
  label: 'Dagger',
  color: '#02fc02',
  ...DEFAULT_DEF,
  bodyWidth: 30,
  bodyHeight: 6,
  bodyDensity: 0.001,
  baseDamage: 6,
};

const ROTATION_PER_HIT = 0.1;
const MAX_ROTATION = 10;

export class DaggerBehavior extends WeaponBehavior {
  readonly id = 'dagger';
  readonly def = DEF;

  calculateDamage(ctx: HitContext): number {
    return DEF.baseDamage + Math.floor(ctx.attacker.weaponState.hitCount * 0.3);
  }

  onHitScaling(ctx: HitContext): void {
    this.onHit(ctx.attacker.weaponState);
    incrementCounter(ctx.attacker.weaponState, 'rotationSpeed', ROTATION_PER_HIT, MAX_ROTATION);
  }
}
