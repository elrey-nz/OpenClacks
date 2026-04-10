import { WeaponBehavior, WeaponDef, UpdateContext, DEFAULT_DEF, incrementCounter } from './WeaponBase';
import { SCALING } from '../constants';
import { ActiveLetter } from '../../types';
import Matter from 'matter-js';

const DEF: WeaponDef = {
  id: 'scroll',
  label: 'Scroll',
  color: '#d0d0ff',
  ...DEFAULT_DEF,
  bodyWidth: 25,
  bodyHeight: 20,
  bodyDensity: 0.001,
  baseDamage: 3,
  superEnabled: false,
  superThreshold: Infinity,
  superDurationMs: 0,
};

const LETTER_RATE_PER_HIT = 0.2;
const LETTER_BASE_INTERVAL_MS = 2000;
const LETTER_DAMAGE = 3;

export class ScrollBehavior extends WeaponBehavior {
  readonly id = 'scroll';
  readonly def = DEF;

  calculateDamage(): number {
    return DEF.baseDamage;
  }

  onHitScaling(ctx: Parameters<WeaponBehavior['onHitScaling']>[0]): void {
    this.onHit(ctx.attacker.weaponState);
    incrementCounter(ctx.attacker.weaponState, 'letterRate', LETTER_RATE_PER_HIT);
  }

  onAbilityUpdate(ctx: UpdateContext): void {
    const ws = ctx.fighter.weaponState;
    const rateBonus = this.getCounter(ws, 'letterRate') * 200;
    const interval = Math.max(200, LETTER_BASE_INTERVAL_MS - rateBonus);
    if (ctx.now - ws.lastFireTime < interval) return;

    const existingLetters = ctx.gameState.letters.filter((l: ActiveLetter) => l.fighterId === ctx.fighter.id);
    const letterIndex = existingLetters.length;
    const spawnAngle = (letterIndex / 8) * Math.PI * 2;

    const body = Matter.Bodies.rectangle(
      ctx.fighter.body.position.x, ctx.fighter.body.position.y, 8, 12,
      {
        isSensor: true, isStatic: false, density: 0.0001, frictionAir: 1,
        label: `letter-${ctx.fighter.id}-${letterIndex}`,
        plugin: {
          fighterId: ctx.fighter.id, isProjectile: true,
          damage: LETTER_DAMAGE, color: '#d0d0ff',
          shape: 'rectangle' as const, size: { width: 8, height: 12 },
        },
      },
    );
    Matter.Composite.add(ctx.world, body);
    ctx.gameState.letters.push({
      body,
      fighterId: ctx.fighter.id,
      orbitAngle: spawnAngle,
      orbitRadius: SCALING.scroll.letterOrbitRadius,
      orbitSpeed: SCALING.scroll.letterOrbitSpeed,
      createdAt: ctx.now,
    });

    ws.lastFireTime = ctx.now;
  }
}
