export const ARENA_WIDTH = 700;
export const ARENA_HEIGHT = 700;
export const WALL_THICKNESS = 40;

export const SPHERE_RADIUS = 56;
export const SPHERE_RESTITUTION = 1;
export const SPHERE_FRICTION = 0;
export const SPHERE_DENSITY = 0.005;
export const SPHERE_AIR_FRICTION = 0;

export const DEFAULT_HP = 100;
export const VELOCITY_DAMAGE_MULTIPLIER = 0.8;
export const BASE_COLLISION_DAMAGE = 2;
export const DAMAGE_VELOCITY_THRESHOLD = 2;
export const BOUNCE_BOOST = 3.5;

export const WEAPON_SIZE = 24;

// Weapon sprite scale: 16x16 pixel art scaled up for visibility
// Scale = 5.25 (quarter of 21)
export const WEAPON_SPRITE_SCALE = 5.25;
export const WEAPON_SPRITE_SIZE = 16 * WEAPON_SPRITE_SCALE;

export const WEAPON_COLORS: Record<string, string> = {
  sword: '#FA8072',
  bow: '#FFD700',
  shield: '#DAA520',
  unarmed: '#A0A0A0',
};

export const FIGHTER_COLORS = [
  '#4FC3F7',
  '#EF5350',
  '#66BB6A',
  '#FFA726',
];

export const ARENA_BG_COLOR = '#F5F0E1';
export const WALL_COLOR = '#333333';
export const FRAME_COLOR = '#2C2C2C';
