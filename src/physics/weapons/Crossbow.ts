import { WeaponBehavior, WeaponDef, UpdateContext, DEFAULT_DEF, incrementCounter } from './WeaponBase';
import { angleToNearest, createProjectileBody } from './WeaponUtils';
import { WEAPON_CONSTANTS, SPHERE_RADIUS, SCALING } from '../constants';

const DEF: WeaponDef = {
  id: 'crossbow',
  label: 'Crossbow',
  color: '#7cb900',
  ...DEFAULT_DEF,
  behavior: 'ranged',
  bodyWidth: 40,
  bodyHeight: 10,
  bodyDensity: 0.001,
  bodyIsSensor: true,
  baseDamage: 0,
};

const BOLT_DAMAGE_PER_HIT = 1;

export class CrossbowBehavior extends WeaponBehavior {
  readonly id = 'crossbow';
  readonly def = DEF;

  calculateDamage(): number {
    return 0;
  }

  onHitScaling(ctx: Parameters<WeaponBehavior['onHitScaling']>[0]): void {
    this.onHit(ctx.attacker.weaponState);
    incrementCounter(ctx.attacker.weaponState, 'boltDamage', BOLT_DAMAGE_PER_HIT);
  }

  onAbilityUpdate(ctx: UpdateContext): void {
    const wc = WEAPON_CONSTANTS.crossbow;
    const ws = ctx.fighter.weaponState;
    const cooldown = this.getCounter(ws, 'boltCooldown', wc.projectileIntervalMs);
    if (ctx.now - ws.lastFireTime < cooldown) return;

    const boltDamage = wc.projectileDamage + this.getCounter(ws, 'boltDamage');
    const angle = angleToNearest(ctx.fighter.body.position, ctx.fighters, ctx.fighter.id);
    const dist = SPHERE_RADIUS + 20;
    const proj = createProjectileBody(
      ctx.world,
      ctx.fighter.body.position.x + Math.cos(angle) * dist,
      ctx.fighter.body.position.y + Math.sin(angle) * dist,
      wc.projectileWidth, wc.projectileHeight, angle, wc.projectileSpeed,
      ctx.fighter.id, boltDamage, '#7cb900', { bolt: true },
    );
    ctx.gameState.projectiles.push(proj);

    const cd = ws.superActive ? wc.projectileIntervalMs / SCALING.crossbow.superFireRateMultiplier : wc.projectileIntervalMs;
    ws.lastFireTime = ctx.now;
    this.setCounter(ws, 'boltCooldown', cd);
  }
}
