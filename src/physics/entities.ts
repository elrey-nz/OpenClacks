import Matter from 'matter-js';
import { FighterConfig, FighterState } from '../types';
import {
  SPHERE_RADIUS,
  SPHERE_RESTITUTION,
  SPHERE_FRICTION,
  SPHERE_DENSITY,
  SPHERE_AIR_FRICTION,
  DEFAULT_HP,
  ARENA_WIDTH,
  ARENA_HEIGHT,
  WEAPON_SPRITE_SIZE,
} from './constants';

const { Bodies, Constraint, Composite } = Matter;

function randomVelocity(): { x: number; y: number } {
  const speed = 4 + Math.random() * 4;
  const angle = Math.random() * Math.PI * 2;
  return { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed };
}

export function createFighter(
  world: Matter.World,
  config: FighterConfig,
  colorIndex: number,
): FighterState {
  const margin = SPHERE_RADIUS * 4;
  const x = margin + Math.random() * (ARENA_WIDTH - margin * 2);
  const y = margin + Math.random() * (ARENA_HEIGHT - margin * 2);

  const body = Bodies.circle(x, y, SPHERE_RADIUS, {
    restitution: SPHERE_RESTITUTION,
    friction: SPHERE_FRICTION,
    density: SPHERE_DENSITY,
    frictionAir: SPHERE_AIR_FRICTION,
    label: `fighter-${config.id}`,
  });

  const velocity = randomVelocity();
  Matter.Body.setVelocity(body, velocity);

  body.plugin = { ...(body.plugin ?? {}), fighterId: config.id, colorIndex };

  let weaponBody: Matter.Body | undefined;
  let constraint: Matter.Constraint | undefined;

  const ws = WEAPON_SPRITE_SIZE;

  if (config.weapon === 'sword') {
    weaponBody = Bodies.rectangle(
      x + SPHERE_RADIUS + ws / 2, y, ws, ws,
      {
        restitution: SPHERE_RESTITUTION,
        friction: 0,
        density: 0.002,
        label: `weapon-${config.id}`,
        isSensor: true,
        plugin: { fighterId: config.id, isWeapon: true, weaponType: 'sword' },
      },
    );

    constraint = Constraint.create({
      bodyA: body,
      pointA: { x: SPHERE_RADIUS, y: 0 },
      bodyB: weaponBody,
      pointB: { x: -ws / 2, y: 0 },
      stiffness: 0.9,
      length: 0,
    });

    Composite.add(world, [weaponBody, constraint]);
  }

  if (config.weapon === 'shield') {
    weaponBody = Bodies.rectangle(
      x + SPHERE_RADIUS + 4, y, ws, ws,
      {
        restitution: SPHERE_RESTITUTION,
        friction: 0,
        density: 0.02,
        label: `weapon-${config.id}`,
        isSensor: true,
        plugin: { fighterId: config.id, isWeapon: true, weaponType: 'shield' },
      },
    );

    constraint = Constraint.create({
      bodyA: body,
      pointA: { x: SPHERE_RADIUS, y: 0 },
      bodyB: weaponBody,
      pointB: { x: -ws / 2, y: 0 },
      stiffness: 0.95,
      length: 0,
    });

    Composite.add(world, [weaponBody, constraint]);
  }

  if (config.weapon === 'bow') {
    weaponBody = Bodies.rectangle(
      x + SPHERE_RADIUS + ws / 2, y, ws, ws,
      {
        restitution: SPHERE_RESTITUTION,
        friction: 0,
        density: 0.001,
        label: `weapon-${config.id}`,
        isSensor: true,
        plugin: { fighterId: config.id, isWeapon: true, weaponType: 'bow' },
      },
    );

    constraint = Constraint.create({
      bodyA: body,
      pointA: { x: SPHERE_RADIUS, y: 0 },
      bodyB: weaponBody,
      pointB: { x: -ws / 2, y: 0 },
      stiffness: 0.9,
      length: 0,
    });

    Composite.add(world, [weaponBody, constraint]);
  }

  Composite.add(world, body);

  return {
    id: config.id,
    weapon: config.weapon,
    hp: DEFAULT_HP,
    maxHp: DEFAULT_HP,
    body,
    weaponBody,
    constraint,
    alive: true,
  };
}

export function removeFighter(world: Matter.World, fighter: FighterState): void {
  const toRemove: Matter.Body[] = [fighter.body];
  if (fighter.weaponBody) toRemove.push(fighter.weaponBody);

  Composite.remove(world, toRemove);
  if (fighter.constraint) {
    Composite.remove(world, fighter.constraint);
  }
}

export function fireArrow(
  world: Matter.World,
  fighter: FighterState,
): Matter.Body {
  const pos = fighter.body.position;
  const angle = Math.random() * Math.PI * 2;
  const speed = 10;

  const arrow = Bodies.rectangle(
    pos.x + Math.cos(angle) * (SPHERE_RADIUS + 15),
    pos.y + Math.sin(angle) * (SPHERE_RADIUS + 15),
    16, 4,
    {
      restitution: 0.3,
      friction: 0,
      density: 0.001,
      frictionAir: 0.005,
      angle,
      label: `arrow-${fighter.id}`,
      plugin: { fighterId: fighter.id, isArrow: true },
    },
  );

  Matter.Body.setVelocity(arrow, {
    x: Math.cos(angle) * speed,
    y: Math.sin(angle) * speed,
  });

  Composite.add(world, arrow);
  return arrow;
}
