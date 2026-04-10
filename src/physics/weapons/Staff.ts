import { WeaponBehavior, WeaponDef, UpdateContext, DEFAULT_DEF, incrementCounter } from './WeaponBase';
import { angleToNearest, createProjectileBody } from './WeaponUtils';
import { WEAPON_CONSTANTS, SPHERE_RADIUS } from '../constants';

const DEF: WeaponDef = {
  id: 'staff',
  label: 'Staff',
  color: '#4677ff',
  ...DEFAULT_DEF,
  behavior: 'ranged',
  bodyWidth: 70,
  bodyHeight: 5,
  bodyDensity: 0.001,
  bodyIsSensor: true,
  baseDamage: 4,
};

const FIREBALL_DAMAGE_PER_HIT = 0.5;
const FIREBALL_SIZE_PER_HIT = 0.5;

export class StaffBehavior extends WeaponBehavior {
  readonly id = 'staff';
  readonly def = DEF;

  calculateDamage(): number {
    return DEF.baseDamage;
  }

  onHitScaling(ctx: Parameters<WeaponBehavior['onHitScaling']>[0]): void {
    this.onHit(ctx.attacker.weaponState);
    incrementCounter(ctx.attacker.weaponState, 'fireballDamage', FIREBALL_DAMAGE_PER_HIT);
    incrementCounter(ctx.attacker.weaponState, 'fireballSize', FIREBALL_SIZE_PER_HIT);
  }

  onAbilityUpdate(ctx: UpdateContext): void {
    const wc = WEAPON_CONSTANTS.staff;
    const ws = ctx.fighter.weaponState;
    if (ctx.now - ws.lastFireTime < wc.projectileIntervalMs) return;

    const dmgBonus = this.getCounter(ws, 'fireballDamage');
    const sizeBonus = this.getCounter(ws, 'fireballSize');
    const damage = wc.projectileDamage + dmgBonus;
    const size = wc.projectileWidth + sizeBonus;
    const directions = ws.superActive ? [0, Math.PI] : [0];

    for (const dirOffset of directions) {
      const baseAngle = angleToNearest(ctx.fighter.body.position, ctx.fighters, ctx.fighter.id) + dirOffset;
      const dist = SPHERE_RADIUS + 20;
      const proj = createProjectileBody(
        ctx.world,
        ctx.fighter.body.position.x + Math.cos(baseAngle) * dist,
        ctx.fighter.body.position.y + Math.sin(baseAngle) * dist,
        size, size, baseAngle, wc.projectileSpeed,
        ctx.fighter.id, damage, '#ff6600', { fireball: true }, 'circle',
      );
      ctx.gameState.projectiles.push(proj);
    }
    ws.lastFireTime = ctx.now;
  }
}
