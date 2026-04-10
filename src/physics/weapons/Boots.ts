import { WeaponBehavior, WeaponDef, HitContext, NO_BODY_WEAPON, incrementCounter } from './WeaponBase';

const DEF: WeaponDef = {
  id: 'boots',
  label: 'Boots',
  color: '#cfcfcf',
  behavior: 'melee',
  ...NO_BODY_WEAPON,
  baseDamage: 5,
  damageType: 'speed_scaled',
  bodyRadiusMultiplier: 0.7,
  superEnabled: false,
  superThreshold: Infinity,
  superDurationMs: 0,
};

const SPEED_PER_HIT = 1;
const SPEED_DAMAGE_FACTOR = 0.5;

export class BootsBehavior extends WeaponBehavior {
  readonly id = 'boots';
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
}
