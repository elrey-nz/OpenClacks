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
