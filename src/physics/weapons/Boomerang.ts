import { WeaponBehavior, WeaponDef, UpdateContext, NO_BODY_WEAPON, incrementCounter } from './WeaponBase';
import { angleToNearest } from './WeaponUtils';
import { WEAPON_CONSTANTS, SPHERE_RADIUS, SCALING } from '../constants';
import { ActiveBoomerang } from '../../types';
import Matter from 'matter-js';

const DEF: WeaponDef = {
  id: 'boomerang',
  label: 'Boomerang',
  color: '#c5c500',
  behavior: 'ranged',
  ...NO_BODY_WEAPON,
  baseDamage: 0,
  damageType: 'flat' as const,
  superEnabled: true,
  superThreshold: 5,
  superDurationMs: 6000,
};

const DAMAGE_PER_HIT = 2;

export class BoomerangBehavior extends WeaponBehavior {
  readonly id = 'boomerang';
  readonly def = DEF;

  calculateDamage(): number {
    return 0;
  }

  onHitScaling(ctx: Parameters<WeaponBehavior['onHitScaling']>[0]): void {
    this.onHit(ctx.attacker.weaponState);
    incrementCounter(ctx.attacker.weaponState, 'boomerangDamage', DAMAGE_PER_HIT);
  }

  onAbilityUpdate(ctx: UpdateContext): void {
    const wc = WEAPON_CONSTANTS.boomerang;
    const ws = ctx.fighter.weaponState;
    const cooldown = this.getCounter(ws, 'boomerangCooldown', wc.projectileIntervalMs);
    if (ctx.now - ws.lastFireTime < cooldown) return;

    const damage = wc.projectileDamage + this.getCounter(ws, 'boomerangDamage');
    const angle = angleToNearest(ctx.fighter.body.position, ctx.fighters, ctx.fighter.id);
    const dist = SPHERE_RADIUS + 20;
    const px = ctx.fighter.body.position.x + Math.cos(angle) * dist;
    const py = ctx.fighter.body.position.y + Math.sin(angle) * dist;

    const body = Matter.Bodies.rectangle(px, py, wc.projectileWidth, wc.projectileHeight, {
      restitution: 0.5, friction: 0, density: 0.001, frictionAir: 0, angle,
      label: `boomerang-${ctx.fighter.id}`,
      plugin: {
        fighterId: ctx.fighter.id, isProjectile: true, damage,
        color: '#c5c500', shape: 'rectangle' as const,
        size: { width: wc.projectileWidth, height: wc.projectileHeight },
      },
    });
    Matter.Body.setVelocity(body, { x: Math.cos(angle) * wc.projectileSpeed, y: Math.sin(angle) * wc.projectileSpeed });
    Matter.Composite.add(ctx.world, body);

    const boomerang: ActiveBoomerang = {
      body, fighterId: ctx.fighter.id, createdAt: ctx.now,
      returnAt: ctx.now + SCALING.boomerang.returnTimeMs,
      returning: false, damage,
    };
    ctx.gameState.boomerangs.push(boomerang);

    const cd = ws.superActive ? wc.projectileIntervalMs * SCALING.boomerang.superCooldownMultiplier : wc.projectileIntervalMs;
    ws.lastFireTime = ctx.now;
    this.setCounter(ws, 'boomerangCooldown', cd);
  }
}
