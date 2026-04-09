import Matter from 'matter-js';
import {
  ARENA_WIDTH,
  ARENA_HEIGHT,
  WALL_THICKNESS,
  WALL_COLOR,
} from './constants';

const { Bodies } = Matter;

export function createArena(world: Matter.World): Matter.Body[] {
  const halfW = ARENA_WIDTH / 2;
  const halfH = ARENA_HEIGHT / 2;
  const t = WALL_THICKNESS;

  const wallOptions: Matter.IBodyDefinition = {
    isStatic: true,
    render: { fillStyle: WALL_COLOR },
    friction: 0,
    restitution: 1,
    label: 'wall',
  };

  const top = Bodies.rectangle(halfW, -t / 2, ARENA_WIDTH + t * 2, t, wallOptions);
  const bottom = Bodies.rectangle(halfW, ARENA_HEIGHT + t / 2, ARENA_WIDTH + t * 2, t, wallOptions);
  const left = Bodies.rectangle(-t / 2, halfH, t, ARENA_HEIGHT + t * 2, wallOptions);
  const right = Bodies.rectangle(ARENA_WIDTH + t / 2, halfH, t, ARENA_HEIGHT + t * 2, wallOptions);

  const walls = [top, bottom, left, right];
  Matter.Composite.add(world, walls);

  return walls;
}
