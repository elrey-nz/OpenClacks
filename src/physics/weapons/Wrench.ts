import { WeaponBehavior, WeaponDef, HitContext, DEFAULT_DEF } from './WeaponBase';
import { spawnTurret } from './WeaponUtils';
import { SCALING } from '../constants';

const DEF: WeaponDef = {
  id: 'wrench',
  label: 'Wrench',
  color: '#fea801',
  ...DEFAULT_DEF,
  bodyWidth: 25,
  bodyHeight: 15,
  baseDamage: 7,
};

export class WrenchBehavior extends WeaponBehavior {
  readonly id = 'wrench';
  readonly def = DEF;

  calculateDamage(ctx: HitContext): number {
    return DEF.baseDamage + this.getCounter(ctx.attacker.weaponState, 'damageBonus');
  }

  onHitScaling(ctx: HitContext): void {
    this.onHit(ctx.attacker.weaponState);
    const ws = ctx.attacker.weaponState;
    const isSuper = ws.superActive;
    const barrels = isSuper ? SCALING.wrench.superBarrels : 1;
    const dmgMult = isSuper ? SCALING.wrench.superDamageMultiplier : 1;
    spawnTurret(
      ctx.world, ctx.gameState, ctx.attacker.id,
      ctx.defender.body.position.x, ctx.defender.body.position.y,
      ctx.now, barrels, dmgMult,
    );
  }
}
