import { WeaponBehavior, WeaponDef, HitContext, UpdateContext, DEFAULT_DEF, incrementCounter } from './WeaponBase';
import Matter from 'matter-js';

const DEF: WeaponDef = {
  id: 'sword',
  label: 'Sword',
  color: '#ff6464',
  ...DEFAULT_DEF,
  bodyWidth: 60,
  bodyHeight: 10,
  baseDamage: 10,
};

const DAMAGE_PER_HIT = 1;

export class SwordBehavior extends WeaponBehavior {
  readonly id = 'sword';
  readonly def = DEF;

  calculateDamage(ctx: HitContext): number {
    const bonus = this.getCounter(ctx.attacker.weaponState, 'damageBonus');
    let damage = DEF.baseDamage + bonus;
    if (ctx.attacker.weaponState.superActive) damage *= 2;
    return damage;
  }

  onHitScaling(ctx: HitContext): void {
    this.onHit(ctx.attacker.weaponState);
    incrementCounter(ctx.attacker.weaponState, 'damageBonus', DAMAGE_PER_HIT);
  }

  onSuperEffect(ctx: UpdateContext): void {
    if (ctx.fighter.weaponState.superActive) {
      Matter.Body.setAngularVelocity(ctx.fighter.body, Math.PI * 4);
    }
  }
}
