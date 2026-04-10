import { WeaponBehavior, WeaponDef, HitContext, DEFAULT_DEF, incrementCounter } from './WeaponBase';
import { SCALING } from '../constants';

const DEF: WeaponDef = {
  id: 'axe',
  label: 'Axe',
  color: '#cf1301',
  ...DEFAULT_DEF,
  bodyWidth: 45,
  bodyHeight: 18,
  bodyDensity: 0.004,
  baseDamage: 10,
};

const CRIT_CHANCE_PER_HIT = 2;

export class AxeBehavior extends WeaponBehavior {
  readonly id = 'axe';
  readonly def = DEF;

  calculateDamage(ctx: HitContext): number {
    let damage = DEF.baseDamage + this.getCounter(ctx.attacker.weaponState, 'damageBonus');
    const critChance = this.getCounter(ctx.attacker.weaponState, 'critChance');

    if (ctx.attacker.weaponState.superActive) {
      if (Math.random() * 100 < critChance) {
        damage += SCALING.axe.superCritMin + Math.random() * (SCALING.axe.superCritMax - SCALING.axe.superCritMin);
      }
    } else {
      if (Math.random() * 100 < critChance) {
        damage += critChance;
      }
    }
    return damage;
  }

  onHitScaling(ctx: HitContext): void {
    this.onHit(ctx.attacker.weaponState);
    incrementCounter(ctx.attacker.weaponState, 'critChance', CRIT_CHANCE_PER_HIT, 100);
  }
}
