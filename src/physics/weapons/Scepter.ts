import { WeaponBehavior, WeaponDef, HitContext, DEFAULT_DEF, incrementCounter } from './WeaponBase';
import { spawnHealingBox } from './WeaponUtils';

const DEF: WeaponDef = {
  id: 'scepter',
  label: 'Scepter',
  color: '#fda7eb',
  ...DEFAULT_DEF,
  bodyWidth: 30,
  bodyHeight: 6,
  bodyDensity: 0.001,
  baseDamage: 6,
};

const LIFESTEAL_PER_HIT = 0.5;
const ALLY_HEAL_FRACTION = 0.3;
const HEALING_BOX_DURATION = 5000;

export class ScepterBehavior extends WeaponBehavior {
  readonly id = 'scepter';
  readonly def = DEF;

  calculateDamage(ctx: HitContext): number {
    const ls = this.getCounter(ctx.attacker.weaponState, 'lifesteal');
    const heal = Math.min(ls, ctx.attacker.maxHp - ctx.attacker.hp);
    ctx.attacker.hp += heal;

    for (const ally of ctx.fighters) {
      if (ally.id !== ctx.attacker.id && ally.alive) {
        ally.hp = Math.min(ally.maxHp, ally.hp + ls * ALLY_HEAL_FRACTION);
      }
    }

    if (ctx.attacker.weaponState.superActive) {
      spawnHealingBox(
        ctx.gameState, ctx.attacker.id,
        ctx.defender.body.position.x, ctx.defender.body.position.y,
        ctx.now, ls, HEALING_BOX_DURATION,
      );
    }

    return DEF.baseDamage;
  }

  onHitScaling(ctx: HitContext): void {
    this.onHit(ctx.attacker.weaponState);
    incrementCounter(ctx.attacker.weaponState, 'lifesteal', LIFESTEAL_PER_HIT);
  }
}
