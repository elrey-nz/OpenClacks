import { WeaponBehavior, WeaponDef, HitContext, DEFAULT_DEF } from './WeaponBase';

const DEF: WeaponDef = {
  id: 'scythe',
  label: 'Scythe',
  color: '#ab58fd',
  ...DEFAULT_DEF,
  bodyWidth: 50,
  bodyHeight: 8,
  baseDamage: 8,
};

const POISON_DPS_PER_STACK = 2;

export class ScytheBehavior extends WeaponBehavior {
  readonly id = 'scythe';
  readonly def = DEF;

  calculateDamage(ctx: HitContext): number {
    const stacks = ctx.attacker.weaponState.poisonStacks[ctx.defender.id] ?? 0;
    return DEF.baseDamage + stacks * POISON_DPS_PER_STACK;
  }

  onHitScaling(ctx: HitContext): void {
    this.onHit(ctx.attacker.weaponState);
    const current = ctx.attacker.weaponState.poisonStacks[ctx.defender.id] ?? 0;
    ctx.attacker.weaponState.poisonStacks[ctx.defender.id] = current + 1;
  }
}
