import { useRef, useCallback, useEffect, useState } from 'react';
import Matter from 'matter-js';
import { FighterConfig, FighterState, FighterSnapshot } from '../types';
import {
  ARENA_WIDTH,
  ARENA_HEIGHT,
  ARENA_BG_COLOR,
  WEAPON_COLORS,
  FIGHTER_COLORS,
  SPHERE_RADIUS,
  FRAME_COLOR,
  WEAPON_SPRITE_SCALE,
} from '../physics/constants';
import { createArena } from '../physics/arena';
import { createFighter, fireArrow } from '../physics/entities';
import { handleCollisions, cleanupCollisionHandler } from '../physics/collisions';
import { WEAPON_SPRITES, ARROW_SPRITE, drawSpriteRotated, WEAPON_ROTATION_OFFSETS } from '../physics/weaponSprites';

const { Engine, Composite } = Matter;

export interface UsePhysicsEngineReturn {
  fighterSnapshots: FighterSnapshot[];
  winnerId: string | null;
}

export function usePhysicsEngine(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  fighterConfigs: FighterConfig[],
  isRunning: boolean,
  onGameOver: (winnerId: string) => void,
): UsePhysicsEngineReturn {
  const engineRef = useRef<Matter.Engine | null>(null);
  const fightersRef = useRef<FighterState[]>([]);
  const frameRef = useRef<number>(0);
  const [fighterSnapshots, setFighterSnapshots] = useState<FighterSnapshot[]>([]);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const onGameOverRef = useRef(onGameOver);
  const lastTimeRef = useRef<number>(0);
  const bowTimerRef = useRef<Map<string, number>>(new Map());
  const arrowsRef = useRef<Matter.Body[]>([]);

  onGameOverRef.current = onGameOver;

  const initEngine = useCallback(() => {
    const engine = Engine.create({
      gravity: { x: 0, y: 0.8, scale: 0.001 },
    });
    engineRef.current = engine;

    createArena(engine.world);

    const fighters: FighterState[] = fighterConfigs.map((config, i) =>
      createFighter(engine.world, config, i),
    );
    fightersRef.current = fighters;

    bowTimerRef.current = new Map();
    arrowsRef.current = [];

    handleCollisions(engine, fighters, engine.world);

    lastTimeRef.current = performance.now();
  }, [fighterConfigs]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const now = performance.now();
    const delta = Math.min(now - lastTimeRef.current, 33.33);
    lastTimeRef.current = now;

    Engine.update(engine, delta);

    // Apply constant rotation to all fighters
    for (const fighter of fightersRef.current) {
      if (fighter.alive && fighter.body) {
        Matter.Body.setAngularVelocity(fighter.body, 0.05);
      }
    }

    // Fire arrows for bow fighters
    const fighters = fightersRef.current;
    for (const fighter of fighters) {
      if (!fighter.alive) continue;
      if (fighter.weapon === 'bow') {
        const lastFire = bowTimerRef.current.get(fighter.id) ?? 0;
        if (now - lastFire > 1500) {
          const arrow = fireArrow(engine.world, fighter);
          arrowsRef.current.push(arrow);
          bowTimerRef.current.set(fighter.id, now);
        }
      }
    }

    // Clean up old arrows
    arrowsRef.current = arrowsRef.current.filter((arrow) => {
      if (!Composite.get(engine.world, arrow.id, 'body')) return false;
      return true;
    });

    // ---- Draw ----
    // Light beige background
    ctx.fillStyle = ARENA_BG_COLOR;
    ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

    // Draw border frame
    ctx.strokeStyle = FRAME_COLOR;
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, ARENA_WIDTH - 3, ARENA_HEIGHT - 3);

    // Draw all physics bodies
    const allBodies = Composite.allBodies(engine.world);

    // First pass: draw walls and balls
    for (const body of allBodies) {
      if (body.label === 'wall') {
        ctx.fillStyle = '#D5CFC0';
        const bw = body.bounds.max.x - body.bounds.min.x;
        const bh = body.bounds.max.y - body.bounds.min.y;
        ctx.fillRect(
          body.position.x - bw / 2,
          body.position.y - bh / 2,
          bw,
          bh,
        );
        continue;
      }

      const fighterId = body.plugin?.fighterId as string | undefined;
      const isWeapon = body.plugin?.isWeapon === true;

      if (fighterId && !isWeapon) {
        const fighter = fighters.find((f) => f.id === fighterId);
        if (!fighter) continue;

        const colorIdx = (fighter.body.plugin?.colorIndex as number) ?? 0;
        const baseColor = FIGHTER_COLORS[colorIdx % FIGHTER_COLORS.length];

        // Main sphere
        ctx.beginPath();
        ctx.arc(body.position.x, body.position.y, SPHERE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = baseColor;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Weapon indicator ring
        const weaponColor = WEAPON_COLORS[fighter.weapon];
        if (weaponColor) {
          ctx.beginPath();
          ctx.arc(body.position.x, body.position.y, SPHERE_RADIUS + 2, 0, Math.PI * 2);
          ctx.strokeStyle = weaponColor;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    }

    // Second pass: draw weapons and arrows on top
    for (const body of allBodies) {
      const fighterId = body.plugin?.fighterId as string | undefined;
      const isWeapon = body.plugin?.isWeapon === true;
      const isArrow = body.plugin?.isArrow === true;

      if (isArrow) {
        // Arrows point in their direction of movement
        const velocity = body.velocity;
        const velocityAngle = Math.atan2(velocity.y, velocity.x);
        drawSpriteRotated(ctx, ARROW_SPRITE, body.position.x, body.position.y, velocityAngle, WEAPON_SPRITE_SCALE);
        continue;
      }

      if (fighterId && isWeapon) {
        const fighter = fighters.find((f) => f.id === fighterId);
        if (!fighter) continue;

        const weaponType = body.plugin?.weaponType as string;
        const sprite = WEAPON_SPRITES[weaponType];
        if (sprite) {
          // Calculate angle pointing outward from ball center to weapon
          const dx = body.position.x - fighter.body.position.x;
          const dy = body.position.y - fighter.body.position.y;
          const outwardAngle = Math.atan2(dy, dx);
          const rotationOffset = WEAPON_ROTATION_OFFSETS[weaponType] ?? 0;
          drawSpriteRotated(ctx, sprite, body.position.x, body.position.y, outwardAngle + rotationOffset, WEAPON_SPRITE_SCALE);
        } else {
          // Fallback for unknown weapons
          ctx.fillStyle = WEAPON_COLORS[weaponType] ?? '#888';
          const bounds = body.bounds;
          const w = bounds.max.x - bounds.min.x;
          const h = bounds.max.y - bounds.min.y;
          ctx.save();
          ctx.translate(body.position.x, body.position.y);
          ctx.rotate(body.angle);
          ctx.fillRect(-w / 2, -h / 2, w, h);
          ctx.restore();
        }
      }
    }

    // Stats in bottom corners
    ctx.fillStyle = '#555';
    ctx.font = '11px monospace';
    const aliveCount = fighters.filter((f) => f.alive).length;
    ctx.fillText(`Alive: ${aliveCount}/${fighters.length}`, 12, ARENA_HEIGHT - 12);
    ctx.textAlign = 'right';
    ctx.fillText(`Sprite Scale: ${WEAPON_SPRITE_SCALE.toFixed(1)}x`, ARENA_WIDTH - 12, ARENA_HEIGHT - 12);
    ctx.textAlign = 'left';

    // Build snapshots for React overlay
    const snapshots: FighterSnapshot[] = fighters.map((f) => ({
      id: f.id,
      weapon: f.weapon,
      hp: f.hp,
      maxHp: f.maxHp,
      x: f.body.position.x,
      y: f.body.position.y,
      alive: f.alive,
    }));
    setFighterSnapshots(snapshots);

    // Check for game over
    const alive = fighters.filter((f) => f.alive);
    if (alive.length <= 1 && fighters.length > 1) {
      const winner = alive[0]?.id ?? fighters[0].id;
      setWinnerId(winner);
      onGameOverRef.current(winner);
      return;
    }

    frameRef.current = requestAnimationFrame(render);
  }, [canvasRef]);

  useEffect(() => {
    if (!isRunning) return;

    initEngine();
    frameRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameRef.current);
      if (engineRef.current) {
        cleanupCollisionHandler(engineRef.current);
        Engine.clear(engineRef.current);
        Composite.clear(engineRef.current.world, false);
      }
      engineRef.current = null;
      fightersRef.current = [];
      setWinnerId(null);
      setFighterSnapshots([]);
    };
  }, [isRunning, initEngine, render]);

  return { fighterSnapshots, winnerId };
}
