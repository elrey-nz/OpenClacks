import { WeaponBehavior, WeaponDef, UpdateContext, NO_BODY_WEAPON, incrementCounter } from './WeaponBase';
import { angleToNearest, createProjectileBody } from './WeaponUtils';
import { WEAPON_CONSTANTS, SPHERE_RADIUS } from '../constants';

const DEF: WeaponDef = {
  id: 'shuriken',
  label: 'Shuriken',
  color: '#858d08',
  behavior: 'ranged',
  ...NO_BODY_WEAPON,
  baseDamage: 0,
  damageType: 'flat' as const,
  superEnabled: true,
  superThreshold: 5,
  superDurationMs: 6000,
};

const BOUNCE_PER_HIT = 1;
const SUPER_BOUNCE_PER_HIT = 2;

export class ShurikenBehavior extends WeaponBehavior {
  readonly id = 'shuriken';
  readonly def = DEF;

  calculateDamage(): number {
    return 0;
  }

  onHitScaling(ctx: Parameters<WeaponBehavior['onHitScaling']>[0]): void {
    this.onHit(ctx.attacker.weaponState);
    const perHit = ctx.attacker.weaponState.superActive ? SUPER_BOUNCE_PER_HIT : BOUNCE_PER_HIT;
    incrementCounter(ctx.attacker.weaponState, 'bounceCount', perHit);
  }

  onAbilityUpdate(ctx: UpdateContext): void {
    const wc = WEAPON_CONSTANTS.shuriken;
    const ws = ctx.fighter.weaponState;
    const cooldown = this.getCounter(ws, 'shurikenCooldown', wc.projectileIntervalMs);
    if (ctx.now - ws.lastFireTime < cooldown) return;

    const bounces = this.getCounter(ws, 'bounceCount');
    const angle = angleToNearest(ctx.fighter.body.position, ctx.fighters, ctx.fighter.id);
    const dist = SPHERE_RADIUS + 20;
    const proj = createProjectileBody(
      ctx.world,
      ctx.fighter.body.position.x + Math.cos(angle) * dist,
      ctx.fighter.body.position.y + Math.sin(angle) * dist,
      wc.projectileWidth, wc.projectileHeight, angle, wc.projectileSpeed,
      ctx.fighter.id, wc.projectileDamage, '#858d08',
      { shuriken: true, bouncesLeft: bounces, bounceCount: 0 }, 'circle',
    );
    ctx.gameState.projectiles.push(proj);

    const cd = ws.superActive ? wc.projectileIntervalMs * 0.5 : wc.projectileIntervalMs;
    ws.lastFireTime = ctx.now;
    this.setCounter(ws, 'shurikenCooldown', cd);
  }
}
