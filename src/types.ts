import Matter from 'matter-js';

export type WeaponType = string;

export interface DOTConfig {
  effectName: string;
  damagePerTick: number;
  tickIntervalMs: number;
  maxTicks: number;
}

export interface ActiveStaticObject {
  body: Matter.Body;
  fighterId: string;
  lastFireTime: number;
  createdAt: number;
}

export interface ActiveAOEZone {
  x: number;
  y: number;
  fighterId: string;
  config: {
    radius: number;
    durationMs: number;
    tickIntervalMs: number;
    healingPerTick?: number;
    damagePerTick?: number;
    appliesDOT?: DOTConfig;
    color: string;
    spawnIntervalMs: number;
  };
  createdAt: number;
  lastTickTime: number;
}

export type GamePhase = 'setup' | 'playing' | 'gameover';

export interface WeaponGameState {
  projectiles: Matter.Body[];
  staticObjects: ActiveStaticObject[];
  aoeZones: ActiveAOEZone[];
  fireTimers: Map<string, number>;
  spawnTimers: Map<string, number>;
  minions: ActiveMinion[];
  letters: ActiveLetter[];
  boomerangs: ActiveBoomerang[];
  flames: ActiveFlame[];
}

export interface FighterConfig {
  id: string;
  weapon: WeaponType;
}

export interface ActiveDOT {
  effectName: string;
  damagePerTick: number;
  tickIntervalMs: number;
  startedAt: number;
  lastTickTime: number;
  expiresAt: number;
  sourceFighterId?: string;
  tickCount?: number;
  maxTicks?: number;
}

export interface WeaponRuntimeState {
  hitCount: number;
  counters: Record<string, number>;
  poisonStacks: Record<string, number>;
  superActive: boolean;
  superReady: boolean;
  superActivatedAt: number;
  lastFireTime: number;
  lastSpecialTime: number;
  parriedTypes: string[];
  copiedAbility: string | null;
  copiedAbilityUses: number;
}

export interface FighterState {
  id: string;
  weapon: WeaponType;
  hp: number;
  maxHp: number;
  body: Matter.Body;
  weaponBody?: Matter.Body;
  weaponBodyB?: Matter.Body;
  constraint?: Matter.Constraint;
  constraintB?: Matter.Constraint;
  alive: boolean;
  activeDOTs: ActiveDOT[];
  weaponState: WeaponRuntimeState;
}

export interface FighterSnapshot {
  id: string;
  weapon: WeaponType;
  hp: number;
  maxHp: number;
  x: number;
  y: number;
  alive: boolean;
  superReady: boolean;
  superActive: boolean;
  hitCount: number;
}

export interface ActiveMinion {
  body: Matter.Body;
  fighterId: string;
  hp: number;
  maxHp: number;
  copiedWeapon: string;
  hitCount: number;
  invincible: boolean;
  createdAt: number;
  lastAttackTime: number;
}

export interface ActiveLetter {
  body: Matter.Body;
  fighterId: string;
  orbitAngle: number;
  orbitRadius: number;
  orbitSpeed: number;
  createdAt: number;
}

export interface ActiveBoomerang {
  body: Matter.Body;
  fighterId: string;
  createdAt: number;
  returnAt: number;
  returning: boolean;
  damage: number;
}

export interface ActiveFlame {
  x: number;
  y: number;
  fighterId: string;
  createdAt: number;
  lifetime: number;
  dps: number;
  radius: number;
  movesTowardEnemy: boolean;
  lastTickTime: number;
  durationMs: number;
}

export interface ProjectilePlugin {
  fighterId: string;
  isProjectile: true;
  damage: number;
  dot?: DOTConfig;
  bounceCount?: number;
  bouncesLeft?: number;
  shuriken?: boolean;
  flask?: boolean;
  fireball?: boolean;
  bolt?: boolean;
  arrow?: boolean;
  healsOwner?: boolean;
  color: string;
  shape: 'rectangle' | 'circle';
  size: { width: number; height: number };
}

export interface WeaponBodyPlugin {
  fighterId: string;
  isWeapon: true;
  weaponType: string;
}

export interface FighterBodyPlugin {
  fighterId: string;
  colorIndex: number;
}

export interface StaticObjectPlugin {
  fighterId: string;
  isStaticObject: true;
  barrels?: number;
  damageMultiplier?: number;
}

export interface MinionPlugin {
  fighterId: string;
  isMinion: true;
  minionId: string;
}
