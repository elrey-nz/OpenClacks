import Matter from 'matter-js';
import { FighterState, WeaponGameState } from '../../types';

export interface WeaponDef {
  id: string;
  label: string;
  color: string;
  behavior: 'melee' | 'ranged' | 'hybrid' | 'passive';
  hasBody: boolean;
  bodyShape: 'rectangle' | 'circle';
  bodyWidth: number;
  bodyHeight: number;
  bodyDensity: number;
  bodyStiffness: number;
  bodyIsSensor: boolean;
  baseDamage: number;
  damageType: 'flat' | 'speed_scaled' | 'rotation_scaled';
  canParry: boolean;
  bodyRadiusMultiplier: number;
  superEnabled: boolean;
  superThreshold: number;
  superDurationMs: number;
}

export interface HitContext {
  attacker: FighterState;
  defender: FighterState;
  baseDamage: number;
  isWeaponHit: boolean;
  world: Matter.World;
  gameState: WeaponGameState;
  fighters: FighterState[];
  now: number;
  deadFighterIds: string[];
}

export interface UpdateContext {
  fighter: FighterState;
  world: Matter.World;
  engine: Matter.Engine;
  fighters: FighterState[];
  gameState: WeaponGameState;
  now: number;
}

export const DEFAULT_DEF = {
  behavior: 'melee' as const,
  hasBody: true,
  bodyShape: 'rectangle' as const,
  bodyDensity: 0.002,
  bodyStiffness: 0.9,
  bodyIsSensor: false,
  damageType: 'flat' as const,
  canParry: false,
  bodyRadiusMultiplier: 1,
  superEnabled: true,
  superThreshold: 5,
  superDurationMs: 6000,
};

export const NO_BODY_WEAPON = {
  hasBody: false,
  bodyShape: 'rectangle' as const,
  bodyWidth: 0,
  bodyHeight: 0,
  bodyDensity: 0,
  bodyStiffness: 0,
  bodyIsSensor: false,
  canParry: false,
  bodyRadiusMultiplier: 1,
};

export abstract class WeaponBehavior {
  abstract readonly id: string;
  abstract readonly def: WeaponDef;

  calculateDamage(_ctx: HitContext): number {
    return this.def.baseDamage;
  }

  onHitScaling(_ctx: HitContext): void {}

  onAbilityUpdate(_ctx: UpdateContext): void {}

  onSuperEffect(_ctx: UpdateContext): void {}

  getCounter(state: FighterState['weaponState'], key: string, defaultValue = 0): number {
    return state.counters[key] ?? defaultValue;
  }

  setCounter(state: FighterState['weaponState'], key: string, value: number): void {
    state.counters[key] = value;
  }

  incrementCounter(state: FighterState['weaponState'], key: string, amount: number, cap?: number): void {
    const current = state.counters[key] ?? 0;
    state.counters[key] = cap !== undefined ? Math.min(current + amount, cap) : current + amount;
  }

  onHit(state: FighterState['weaponState']): void {
    state.hitCount++;
  }
}

export function makeDummyGameState(): WeaponGameState {
  return {
    projectiles: [],
    staticObjects: [],
    aoeZones: [],
    fireTimers: new Map(),
    spawnTimers: new Map(),
    minions: [],
    letters: [],
    boomerangs: [],
    flames: [],
  };
}

export function incrementCounter(
  state: FighterState['weaponState'],
  key: string,
  amount: number,
  cap?: number,
): void {
  const current = state.counters[key] ?? 0;
  state.counters[key] = cap !== undefined ? Math.min(current + amount, cap) : current + amount;
}
