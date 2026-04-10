import { WeaponBehavior, WeaponDef, HitContext, DEFAULT_DEF, incrementCounter } from './WeaponBase';
import { SCALING } from '../constants';

const DEF: WeaponDef = {
  id: 'lance',
  label: 'Lance',
  color: '#feed9a',
  ...DEFAULT_DEF,
  bodyWidth: 120,
  bodyHeight: 3,
  bodyDensity: 0.001,
  baseDamage: 10,
};

const JOUST_DAMAGE_PER_HIT = 2;

export class LanceBehavior extends WeaponBehavior {
  readonly id = 'lance';
  readonly def = DEF;

  calculateDamage(ctx: HitContext): number {
    let damage = DEF.baseDamage + this.getCounter(ctx.attacker.weaponState, 'joustDamage');
    if (this.getCounter(ctx.attacker.weaponState, 'jousting') === 1) {
      damage += this.getCounter(ctx.attacker.weaponState, 'joustDamage');
    }
    return damage;
  }

  onHitScaling(ctx: HitContext): void {
    this.onHit(ctx.attacker.weaponState);
    incrementCounter(ctx.attacker.weaponState, 'joustDamage', JOUST_DAMAGE_PER_HIT);
  }

  onAbilityUpdate(ctx: Parameters<WeaponBehavior['onAbilityUpdate']>[0]): void {
    const ws = ctx.fighter.weaponState;
    const isJousting = this.getCounter(ws, 'jousting') === 1;
    if (isJousting && ctx.now >= this.getCounter(ws, 'joustUntil')) {
      this.setCounter(ws, 'jousting', 0);
    }
    if (!isJousting && ctx.now - ws.lastSpecialTime >= SCALING.lance.joustIntervalMs) {
      const nearest = ctx.fighters.find(f => f.alive && f.id !== ctx.fighter.id);
      const targetAngle = nearest
        ? Math.atan2(nearest.body.position.y - ctx.fighter.body.position.y, nearest.body.position.x - ctx.fighter.body.position.x)
        : ctx.fighter.body.angle;
      this.setCounter(ws, 'jousting', 1);
      this.setCounter(ws, 'joustUntil', ctx.now + SCALING.lance.joustDurationMs);
      Matter.Body.setVelocity(ctx.fighter.body, {
        x: Math.cos(targetAngle) * SCALING.lance.joustSpeed,
        y: Math.sin(targetAngle) * SCALING.lance.joustSpeed,
      });
      ws.lastSpecialTime = ctx.now;
    }
  }
}

import Matter from 'matter-js';
