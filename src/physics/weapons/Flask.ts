import { WeaponBehavior, WeaponDef, UpdateContext, NO_BODY_WEAPON, incrementCounter } from './WeaponBase';
import { angleToNearest, createProjectileBody } from './WeaponUtils';
import { WEAPON_CONSTANTS, SPHERE_RADIUS, SCALING } from '../constants';

const DEF: WeaponDef = {
  id: 'flask',
  label: 'Flask',
  color: '#009a04',
  behavior: 'ranged',
  ...NO_BODY_WEAPON,
  baseDamage: 0,
  damageType: 'flat' as const,
  superEnabled: true,
  superThreshold: 5,
  superDurationMs: 6000,
};

const SPILL_DPS_PER_HIT = 1;

export class FlaskBehavior extends WeaponBehavior {
  readonly id = 'flask';
  readonly def = DEF;

  calculateDamage(): number {
    return 0;
  }

  onHitScaling(ctx: Parameters<WeaponBehavior['onHitScaling']>[0]): void {
    this.onHit(ctx.attacker.weaponState);
    incrementCounter(ctx.attacker.weaponState, 'spillDPS', SPILL_DPS_PER_HIT);
  }

  onAbilityUpdate(ctx: UpdateContext): void {
    const wc = WEAPON_CONSTANTS.flask;
    const ws = ctx.fighter.weaponState;
    const cooldown = this.getCounter(ws, 'flaskCooldown', wc.projectileIntervalMs);
    if (ctx.now - ws.lastFireTime < cooldown) return;

    const spillDPS = this.getCounter(ws, 'spillDPS', 2) + SPILL_DPS_PER_HIT * ws.hitCount;
    const angle = angleToNearest(ctx.fighter.body.position, ctx.fighters, ctx.fighter.id);
    const dist = SPHERE_RADIUS + 15;
    const proj = createProjectileBody(
      ctx.world,
      ctx.fighter.body.position.x + Math.cos(angle) * dist,
      ctx.fighter.body.position.y + Math.sin(angle) * dist,
      wc.projectileWidth, wc.projectileHeight, angle, wc.projectileSpeed,
      ctx.fighter.id, wc.projectileDamage, '#009a04',
      { flask: true, spillDPS }, 'circle',
    );
    ctx.gameState.projectiles.push(proj);

    const cd = ws.superActive ? wc.projectileIntervalMs * SCALING.flask.superCooldownMultiplier : wc.projectileIntervalMs;
    ws.lastFireTime = ctx.now;
    this.setCounter(ws, 'flaskCooldown', cd);
  }
}
