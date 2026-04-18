/**
 * Grimoire — book-shaped body attached to the ball.
 *
 * Mechanic: Each hit spawns a minion that copies the target's weapon type and scaling.
 *           Minions have their own HP, chase enemies, and attack. Each hit increases
 *           minion max HP by +1. Minions share the weapon behavior of the copied opponent.
 * Super:    Minions become invincible (cannot be killed), have infinite HP, and are smaller targets.
 */
import { WeaponBehavior, WeaponDef, HitContext, DEFAULT_DEF, incrementCounter } from './WeaponBase';
import { spawnMinion } from './WeaponUtils';
import { SCALING } from '../constants';

const DEF: WeaponDef = {
  id: 'grimoire',
  label: 'Grimoire',
  color: '#888888',
  ...DEFAULT_DEF,
  bodyWidth: 30,
  bodyHeight: 25,
  bodyDensity: 0.001,
  baseDamage: 4,
};

const MINION_HP_PER_HIT = 1;

export class GrimoireBehavior extends WeaponBehavior {
  readonly id = 'grimoire';
  readonly def = DEF;

  calculateDamage(ctx: HitContext): number {
    const isSuper = ctx.attacker.weaponState.superActive;
    const minionHp = SCALING.grimoire.minionBaseHp + this.getCounter(ctx.attacker.weaponState, 'minionHp');
    spawnMinion(
      ctx.world, ctx.gameState, ctx.attacker, ctx.defender.weapon,
      ctx.now, isSuper, minionHp,
    );
    return DEF.baseDamage;
  }

  onHitScaling(ctx: HitContext): void {
    this.onHit(ctx.attacker.weaponState);
    incrementCounter(ctx.attacker.weaponState, 'minionHp', MINION_HP_PER_HIT);
  }
}
