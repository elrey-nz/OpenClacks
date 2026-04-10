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
} from './constants';
import { getWeaponDefinition, hasAttachedWeapon } from './weaponRegistry';
import { createWeaponRuntimeState } from './weaponSystem';

const { Bodies, Constraint, Composite, Body } = Matter;

function randomVelocity(): { x: number; y: number } {
  const speed = 4 + Math.random() * 4;
  const angle = Math.random() * Math.PI * 2;
  return { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed };
}

interface WeaponBodyResult {
  wb: Matter.Body;
  c: Matter.Constraint;
}

function createWeaponBody(
  body: Matter.Body,
  configId: string,
  def: ReturnType<typeof getWeaponDefinition>,
  effectiveRadius: number,
  offsetAngle: number,
): WeaponBodyResult | null {
  if (!def || !def.hasBody) return null;

  const bw = def.bodyWidth;
  const bh = def.bodyHeight;
  const isCircle = def.bodyShape === 'circle';
  const spawnDist = effectiveRadius + (isCircle ? bw / 2 : bh / 2) + 2;

  const x = body.position.x + Math.cos(offsetAngle) * spawnDist;
  const y = body.position.y + Math.sin(offsetAngle) * spawnDist;

  const wb = isCircle
    ? Bodies.circle(x, y, bw / 2, {
        restitution: SPHERE_RESTITUTION,
        friction: 0,
        density: def.bodyDensity,
        label: `weapon-${configId}`,
        isSensor: def.bodyIsSensor,
        plugin: {
          fighterId: configId,
          isWeapon: true,
          weaponType: def.id,
        },
      })
    : Bodies.rectangle(x, y, bw, bh, {
        restitution: SPHERE_RESTITUTION,
        friction: 0,
        density: def.bodyDensity,
        label: `weapon-${configId}`,
        isSensor: def.bodyIsSensor,
        plugin: {
          fighterId: configId,
          isWeapon: true,
          weaponType: def.id,
        },
      });

  const c = Constraint.create({
    bodyA: body,
    pointA: { x: Math.cos(offsetAngle) * effectiveRadius, y: Math.sin(offsetAngle) * effectiveRadius },
    bodyB: wb,
    pointB: { x: 0, y: 0 },
    stiffness: def.bodyStiffness,
    length: 0,
  });

  return { wb, c };
}

export function createFighter(
  world: Matter.World,
  config: FighterConfig,
  colorIndex: number,
): FighterState {
  const def = getWeaponDefinition(config.weapon);
  const radiusMultiplier = def?.bodyRadiusMultiplier ?? 1;
  const effectiveRadius = SPHERE_RADIUS * radiusMultiplier;
  const margin = effectiveRadius * 4;

  const x = margin + Math.random() * (ARENA_WIDTH - margin * 2);
  const y = margin + Math.random() * (ARENA_HEIGHT - margin * 2);

  const body = Bodies.circle(x, y, effectiveRadius, {
    restitution: SPHERE_RESTITUTION,
    friction: SPHERE_FRICTION,
    density: SPHERE_DENSITY,
    frictionAir: SPHERE_AIR_FRICTION,
    label: `fighter-${config.id}`,
  });

  const velocity = randomVelocity();
  Body.setVelocity(body, velocity);

  body.plugin = { fighterId: config.id, colorIndex };

  let weaponBody: Matter.Body | undefined;
  let weaponBodyB: Matter.Body | undefined;
  let constraint: Matter.Constraint | undefined;
  let constraintB: Matter.Constraint | undefined;

  if (def && hasAttachedWeapon(def)) {
    const primary = createWeaponBody(body, config.id, def, effectiveRadius, 0);
    if (primary) {
      weaponBody = primary.wb;
      constraint = primary.c;
      Composite.add(world, [weaponBody, constraint]);
    }
  }

  Composite.add(world, body);

  return {
    id: config.id,
    weapon: config.weapon,
    hp: DEFAULT_HP,
    maxHp: DEFAULT_HP,
    body,
    weaponBody,
    weaponBodyB,
    constraint,
    constraintB,
    alive: true,
    activeDOTs: [],
    weaponState: createWeaponRuntimeState(),
  };
}

export function removeFighter(world: Matter.World, fighter: FighterState): void {
  const toRemove: Matter.Body[] = [fighter.body];
  if (fighter.weaponBody) toRemove.push(fighter.weaponBody);
  if (fighter.weaponBodyB) toRemove.push(fighter.weaponBodyB);

  Composite.remove(world, toRemove);
  if (fighter.constraint) Composite.remove(world, fighter.constraint);
  if (fighter.constraintB) Composite.remove(world, fighter.constraintB);
}
