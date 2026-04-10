import { WeaponBehavior, WeaponDef, HitContext, UpdateContext, DEFAULT_DEF, incrementCounter } from './WeaponBase';
import Matter from 'matter-js';

const DEF: WeaponDef = {
  id: 'rapier',
  label: 'Rapier',
  color: '#ffffff',
  ...DEFAULT_DEF,
  bodyWidth: 70,
  bodyHeight: 3,
  bodyDensity: 0.001,
  baseDamage: 7,
  superEnabled: false,
  superThreshold: Infinity,
  superDurationMs: 0,
};

const LUNGE_RATE_PER_HIT = 0.2;
const LUNGE_DAMAGE_PER_HIT = 1;
const LUNGE_BASE_COOLDOWN_MS = 2000;
const LUNGE_SPEED = 20;
const LUNGE_DURATION_MS = 200;

export class RapierBehavior extends WeaponBehavior {
  readonly id = 'rapier';
  readonly def = DEF;

  calculateDamage(ctx: HitContext): number {
    let damage = DEF.baseDamage + this.getCounter(ctx.attacker.weaponState, 'lungeDamage');
    if (this.getCounter(ctx.attacker.weaponState, 'lunging') === 1) {
      damage += this.getCounter(ctx.attacker.weaponState, 'lungeDamageSnapshot');
    }
    return damage;
  }

  onHitScaling(ctx: HitContext): void {
    this.onHit(ctx.attacker.weaponState);
    incrementCounter(ctx.attacker.weaponState, 'lungeRate', LUNGE_RATE_PER_HIT);
    incrementCounter(ctx.attacker.weaponState, 'lungeDamage', LUNGE_DAMAGE_PER_HIT);
  }

  onAbilityUpdate(ctx: UpdateContext): void {
    const ws = ctx.fighter.weaponState;
    const rateReduction = this.getCounter(ws, 'lungeRate') * 200;
    const cooldown = Math.max(200, LUNGE_BASE_COOLDOWN_MS - rateReduction);
    const isLunging = this.getCounter(ws, 'lunging') === 1;

    if (isLunging && ctx.now >= this.getCounter(ws, 'lungeUntil')) {
      this.setCounter(ws, 'lunging', 0);
    }
    if (!isLunging && ctx.now - ws.lastSpecialTime >= cooldown) {
      const angle = ctx.fighter.body.angle;
      const lungeDmg = DEF.baseDamage + this.getCounter(ws, 'lungeDamage');
      this.setCounter(ws, 'lunging', 1);
      this.setCounter(ws, 'lungeUntil', ctx.now + LUNGE_DURATION_MS);
      this.setCounter(ws, 'lungeDamageSnapshot', lungeDmg);
      Matter.Body.setVelocity(ctx.fighter.body, {
        x: Math.cos(angle) * LUNGE_SPEED,
        y: Math.sin(angle) * LUNGE_SPEED,
      });
      ws.lastSpecialTime = ctx.now;
    }
  }
}
