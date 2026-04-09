import Matter from 'matter-js';

export type WeaponType = 'sword' | 'shield' | 'bow' | 'unarmed';

export type GamePhase = 'setup' | 'playing' | 'gameover';

export interface FighterConfig {
  id: string;
  weapon: WeaponType;
}

export interface FighterState {
  id: string;
  weapon: WeaponType;
  hp: number;
  maxHp: number;
  body: Matter.Body;
  weaponBody?: Matter.Body;
  constraint?: Matter.Constraint;
  alive: boolean;
}

export interface FighterSnapshot {
  id: string;
  weapon: WeaponType;
  hp: number;
  maxHp: number;
  x: number;
  y: number;
  alive: boolean;
}
