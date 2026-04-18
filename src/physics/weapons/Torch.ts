/**
 * Torch — short rod with a flame particle effect.
 *
 * Mechanic: Each hit creates a flame entity near the target. Flames have a base lifetime
 *           (e.g. 3s) and deal minor DPS in a small radius. Each hit increases flame lifetime by +1s.
 * Super:    Flames have infinite lifetime and slowly move toward the nearest enemy.
 */
import { WeaponBehavior, WeaponDef, HitContext, DEFAULT_DEF, incrementCounter } from './WeaponBase';
import { spawnFlame } from './WeaponUtils';
import { SCALING } from '../constants';

const DEF: WeaponDef = {
  id: 'torch',
  label: 'Torch',
  color: '#983a8e',
  ...DEFAULT_DEF,
  bodyWidth: 30,
  bodyHeight: 8,
  bodyDensity: 0.001,
  baseDamage: 5,
};

const FLAME_LIFETIME_PER_HIT = 1000;

export class TorchBehavior extends WeaponBehavior {
  readonly id = 'torch';
  readonly def = DEF;

  calculateDamage(ctx: HitContext): number {
    const lifetimeBonus = this.getCounter(ctx.attacker.weaponState, 'flameLifetime');
    const baseLifetime = SCALING.torch.flameBaseLifetimeMs + lifetimeBonus;
    const isInfinite = ctx.attacker.weaponState.superActive;

    spawnFlame(
      ctx.gameState, ctx.attacker.id,
      ctx.defender.body.position.x, ctx.defender.body.position.y,
      ctx.now, SCALING.torch.flameDPS, SCALING.torch.flameRadius,
      isInfinite ? Infinity : baseLifetime,
      isInfinite,
    );
    return DEF.baseDamage;
  }

  onHitScaling(ctx: HitContext): void {
    this.onHit(ctx.attacker.weaponState);
    incrementCounter(ctx.attacker.weaponState, 'flameLifetime', FLAME_LIFETIME_PER_HIT);
  }
}
