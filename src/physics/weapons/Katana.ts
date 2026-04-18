/**
 * Katana — medium-length thin blade.
 *
 * Mechanic: Each hit/parry increments a "slash counter" by 1. On hit, the target takes
 *           repeated tick damage (every 0.2s) until the number of ticks equals the slash
 *           counter at the moment of impact. E.g. slash counter=5 → 5 ticks over 1.0s.
 * Super:    Two additional katanas attached 120° apart, each applying the same slash mechanic.
 */
import { WeaponBehavior, WeaponDef, HitContext, DEFAULT_DEF, incrementCounter } from './WeaponBase';
import { addDotToTarget } from './WeaponUtils';

const DEF: WeaponDef = {
  id: 'katana',
  label: 'Katana',
  color: '#82ffbb',
  ...DEFAULT_DEF,
  bodyWidth: 55,
  bodyHeight: 5,
  bodyDensity: 0.001,
  baseDamage: 8,
};

const SLASH_PER_HIT = 1;
const TICK_INTERVAL_MS = 200;
const TICK_DAMAGE = 2;

export class KatanaBehavior extends WeaponBehavior {
  readonly id = 'katana';
  readonly def = DEF;

  calculateDamage(ctx: HitContext): number {
    const slashCount = this.getCounter(ctx.attacker.weaponState, 'slashCounter');
    if (slashCount > 0) {
      addDotToTarget(
        ctx.defender,
        `katana_slash_${ctx.attacker.id}_${ctx.now}`,
        TICK_DAMAGE, TICK_INTERVAL_MS, slashCount,
        ctx.now, ctx.attacker.id,
      );
    }
    return DEF.baseDamage;
  }

  onHitScaling(ctx: HitContext): void {
    this.onHit(ctx.attacker.weaponState);
    incrementCounter(ctx.attacker.weaponState, 'slashCounter', SLASH_PER_HIT);
  }
}
