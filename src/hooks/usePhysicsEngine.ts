import { useRef, useCallback, useEffect, useState } from 'react';
import Matter from 'matter-js';
import { FighterConfig, FighterState, FighterSnapshot } from '../types';
import {
  ARENA_WIDTH,
  ARENA_HEIGHT,
  ARENA_BG_COLOR,
  FIGHTER_COLORS,
  SPHERE_RADIUS,
  FRAME_COLOR,
} from '../physics/constants';
import { createArena } from '../physics/arena';
import { createFighter, removeFighter } from '../physics/entities';
import { handleCollisions, cleanupCollisionHandler } from '../physics/collisions';
import { getWeaponDefinition } from '../physics/weaponRegistry';
import {
  createWeaponGameState,
  updateAllWeapons,
  tickDOTs,
  cleanupProjectiles,
  WeaponGameState,
} from '../physics/weaponSystem';

const { Engine, Composite, Body } = Matter;

const DOT_COLORS: Record<string, string> = {
  poison: '#9C27B0',
};

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
  const gameStateRef = useRef<WeaponGameState>(createWeaponGameState());

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
    gameStateRef.current = createWeaponGameState();

    handleCollisions(engine, fighters, engine.world, gameStateRef.current);

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

    const gameState = gameStateRef.current;
    const fighters = fightersRef.current;

    const MAX_SPEED = 15;
    for (const fighter of fighters) {
      if (fighter.alive && fighter.body) {
        const baseAngVel = 0.05;
        const rotBonus = fighter.weaponState.counters['rotationSpeed'] ?? 0;
        const totalAngVel = baseAngVel + rotBonus;
        Body.setAngularVelocity(fighter.body, totalAngVel);

        const speedBonus = fighter.weaponState.counters['speedBonus'] ?? 0;
        const effectiveMaxSpeed = MAX_SPEED + speedBonus;
        const vel = fighter.body.velocity;
        const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
        if (speed > effectiveMaxSpeed) {
          const scale = effectiveMaxSpeed / speed;
          Body.setVelocity(fighter.body, { x: vel.x * scale, y: vel.y * scale });
        }
      }
    }

    for (const fighter of fighters) {
      if (fighter.alive && fighter.weaponBody) {
        const def = getWeaponDefinition(fighter.weapon);
        if (!def) continue;
        const angle = fighter.body.angle;
        const bw = def.bodyWidth;
        const bh = def.bodyHeight;
        const effectiveRadius = SPHERE_RADIUS * (def.bodyRadiusMultiplier);
        const dist = effectiveRadius + (def.bodyShape === 'circle' ? bw / 2 : bh / 2) + 2;
        const wx = fighter.body.position.x + Math.cos(angle) * dist;
        const wy = fighter.body.position.y + Math.sin(angle) * dist;
        Body.setPosition(fighter.weaponBody, { x: wx, y: wy });
        Body.setAngle(fighter.weaponBody, angle);
        Body.setVelocity(fighter.weaponBody, fighter.body.velocity);
      }
      if (fighter.alive && fighter.weaponBodyB) {
        const def = getWeaponDefinition(fighter.weapon);
        if (!def) continue;
        const angle = fighter.body.angle + Math.PI;
        const bw = def.bodyWidth;
        const bh = def.bodyHeight;
        const effectiveRadius = SPHERE_RADIUS * (def.bodyRadiusMultiplier);
        const dist = effectiveRadius + (def.bodyShape === 'circle' ? bw / 2 : bh / 2) + 2;
        const wx = fighter.body.position.x + Math.cos(angle) * dist;
        const wy = fighter.body.position.y + Math.sin(angle) * dist;
        Body.setPosition(fighter.weaponBodyB, { x: wx, y: wy });
        Body.setAngle(fighter.weaponBodyB, angle);
        Body.setVelocity(fighter.weaponBodyB, fighter.body.velocity);
      }
    }

    updateAllWeapons(engine.world, engine, fighters, gameState, now);

    const dotDead = tickDOTs(fighters, now);
    for (const deadId of dotDead) {
      const deadFighter = fighters.find((f) => f.id === deadId);
      if (deadFighter) {
        removeFighter(engine.world, deadFighter);
      }
    }

    cleanupProjectiles(engine.world, gameState);

    ctx.fillStyle = ARENA_BG_COLOR;
    ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

    ctx.strokeStyle = FRAME_COLOR;
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, ARENA_WIDTH - 3, ARENA_HEIGHT - 3);

    for (const zone of gameState.aoeZones) {
      const remaining = zone.config.durationMs - (now - zone.createdAt);
      const alpha = Math.min(1, remaining / 1000);
      ctx.beginPath();
      ctx.arc(zone.x, zone.y, zone.config.radius, 0, Math.PI * 2);
      ctx.fillStyle = zone.config.color;
      ctx.globalAlpha = alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    for (const flame of gameState.flames) {
      const remaining = flame.durationMs === Infinity ? 1 : Math.min(1, (flame.durationMs - (now - flame.createdAt)) / 1000);
      ctx.beginPath();
      ctx.arc(flame.x, flame.y, flame.radius, 0, Math.PI * 2);
      ctx.fillStyle = flame.fighterId.includes('scepter') ? 'rgba(253, 167, 235, 0.3)' : 'rgba(255, 100, 0, 0.3)';
      ctx.globalAlpha = remaining;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    const allBodies = Composite.allBodies(engine.world);

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
      const isProjectile = body.plugin?.isProjectile === true;
      const isStaticObj = body.plugin?.isStaticObject === true;
      const isMinion = body.plugin?.isMinion === true;

      if (isStaticObj && fighterId) {
        const fighter = fighters.find((f) => f.id === fighterId);
        const def = fighter ? getWeaponDefinition(fighter.weapon) : undefined;
        ctx.beginPath();
        ctx.arc(body.position.x, body.position.y, 15, 0, Math.PI * 2);
        ctx.fillStyle = def?.color ?? '#607D8B';
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
        const barrels = (body.plugin?.barrels as number) ?? 1;
        if (barrels > 1) {
          ctx.beginPath();
          ctx.arc(body.position.x, body.position.y, 8, 0, Math.PI * 2);
          ctx.strokeStyle = '#ff6600';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(body.position.x, body.position.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#333';
        ctx.fill();
        continue;
      }

      if (isMinion) {
        const fighter = fighters.find((f) => f.id === fighterId);
        const def = fighter ? getWeaponDefinition(fighter.weapon) : undefined;
        const minion = gameState.minions.find((m: { body: Matter.Body }) => m.body === body);
        const radius = minion?.invincible ? 8 : 12;
        ctx.beginPath();
        ctx.arc(body.position.x, body.position.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = def?.color ?? '#888';
        ctx.globalAlpha = 0.7;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.stroke();
        if (minion?.invincible) {
          ctx.beginPath();
          ctx.arc(body.position.x, body.position.y, radius + 3, 0, Math.PI * 2);
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        continue;
      }

      if (fighterId && !isWeapon && !isProjectile && !isStaticObj && !isMinion) {
        const fighter = fighters.find((f) => f.id === fighterId);
        if (!fighter) continue;

        const colorIdx = (fighter.body.plugin?.colorIndex as number) ?? 0;
        const baseColor = FIGHTER_COLORS[colorIdx % FIGHTER_COLORS.length];

        const def = getWeaponDefinition(fighter.weapon);
        const effectiveRadius = SPHERE_RADIUS * (def?.bodyRadiusMultiplier ?? 1);

        ctx.beginPath();
        ctx.arc(body.position.x, body.position.y, effectiveRadius, 0, Math.PI * 2);
        ctx.fillStyle = baseColor;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        if (def?.color) {
          ctx.beginPath();
          ctx.arc(body.position.x, body.position.y, effectiveRadius + 3, 0, Math.PI * 2);
          ctx.strokeStyle = def.color;
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

        const ws = fighter.weaponState;
        if (ws.superActive) {
          ctx.beginPath();
          ctx.arc(body.position.x, body.position.y, effectiveRadius + 8, 0, Math.PI * 2);
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.5 + Math.sin(now * 0.01) * 0.3;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        for (const dot of fighter.activeDOTs) {
          const dotColor = DOT_COLORS[dot.effectName] ?? '#FF5722';
          ctx.beginPath();
          ctx.arc(body.position.x, body.position.y, effectiveRadius + 6, 0, Math.PI * 2);
          ctx.strokeStyle = dotColor;
          ctx.lineWidth = 3;
          ctx.globalAlpha = 0.6 + Math.sin(now * 0.01) * 0.3;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        continue;
      }
    }

    for (const body of allBodies) {
      const fighterId = body.plugin?.fighterId as string | undefined;
      const isWeapon = body.plugin?.isWeapon === true;
      const isProjectile = body.plugin?.isProjectile === true;

      if (isProjectile && !isWeapon) {
        const color = (body.plugin?.color as string) ?? '#888';
        const shape = body.plugin?.shape as 'rectangle' | 'circle' ?? 'rectangle';
        const size = body.plugin?.size as { width: number; height: number } | undefined;

        ctx.fillStyle = color;
        if (shape === 'circle') {
          const r = (size?.width ?? 8) / 2;
          ctx.beginPath();
          ctx.arc(body.position.x, body.position.y, r, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.save();
          ctx.translate(body.position.x, body.position.y);
          ctx.rotate(body.angle);
          const w = size?.width ?? 8;
          const h = size?.height ?? 4;
          ctx.fillRect(-w / 2, -h / 2, w, h);
          ctx.restore();
        }
        continue;
      }

      if (fighterId && isWeapon) {
        const fighter = fighters.find((f) => f.id === fighterId);
        if (!fighter) continue;

        const weaponType = body.plugin?.weaponType as string;
        const def = getWeaponDefinition(weaponType);
        if (!def) continue;

        const sizeBonus = fighter.weaponState.counters['sizeBonus'] ?? 0;
        const shieldWidthBonus = fighter.weaponState.counters['shieldWidth'] ?? 0;

        let drawWidth = def.bodyWidth + sizeBonus;
        let drawHeight = def.bodyHeight;

        if (weaponType === 'shield') {
          drawWidth = def.bodyWidth * (1 + shieldWidthBonus / 100);
          drawHeight = def.bodyHeight * (1 + shieldWidthBonus / 100);
        }

        ctx.fillStyle = def.color;
        ctx.save();
        ctx.translate(body.position.x, body.position.y);

        const dx = body.position.x - fighter.body.position.x;
        const dy = body.position.y - fighter.body.position.y;
        const outwardAngle = Math.atan2(dy, dx);
        ctx.rotate(outwardAngle);

        if (def.bodyShape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, drawWidth / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(0,0,0,0.3)';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          ctx.fillRect(-drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
          ctx.strokeStyle = 'rgba(0,0,0,0.2)';
          ctx.lineWidth = 1;
          ctx.strokeRect(-drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        }

        if (weaponType === 'scepter' || weaponType === 'torch' || weaponType === 'staff') {
          ctx.beginPath();
          ctx.arc(drawWidth / 2, 0, 4, 0, Math.PI * 2);
          ctx.fillStyle = weaponType === 'torch' ? '#FF6600' : weaponType === 'staff' ? '#FF4400' : '#ff69b4';
          ctx.fill();
        }

        if (weaponType === 'scythe') {
          ctx.beginPath();
          ctx.arc(drawWidth / 2, -drawHeight, drawHeight * 1.5, -Math.PI * 0.3, Math.PI * 0.3);
          ctx.strokeStyle = def.color;
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        if (weaponType === 'grimoire') {
          ctx.strokeStyle = '#555';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(-drawWidth / 4, -drawHeight / 3);
          ctx.lineTo(drawWidth / 4, -drawHeight / 3);
          ctx.moveTo(-drawWidth / 4, 0);
          ctx.lineTo(drawWidth / 4, 0);
          ctx.moveTo(-drawWidth / 4, drawHeight / 3);
          ctx.lineTo(drawWidth / 4, drawHeight / 3);
          ctx.stroke();
        }

        if (weaponType === 'scroll') {
          ctx.beginPath();
          ctx.arc(-drawWidth / 2, 0, 4, 0, Math.PI * 2);
          ctx.arc(drawWidth / 2, 0, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#aaa';
          ctx.fill();
        }

        ctx.restore();
      }
    }

    for (const letter of gameState.letters) {
      ctx.save();
      ctx.translate(letter.body.position.x, letter.body.position.y);
      ctx.rotate(letter.orbitAngle);
      ctx.fillStyle = '#d0d0ff';
      ctx.fillRect(-4, -6, 8, 12);
      ctx.strokeStyle = '#6666aa';
      ctx.lineWidth = 1;
      ctx.strokeRect(-4, -6, 8, 12);
      ctx.fillStyle = '#6666aa';
      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const charIdx = Math.floor(letter.orbitAngle * 10) % letters.length;
      ctx.fillText(letters[charIdx], 0, 0);
      ctx.restore();
    }

    for (const b of gameState.boomerangs) {
      ctx.save();
      ctx.translate(b.body.position.x, b.body.position.y);
      ctx.rotate(b.body.angle);
      ctx.beginPath();
      ctx.moveTo(-15, 0);
      ctx.quadraticCurveTo(-10, -8, 0, -5);
      ctx.quadraticCurveTo(10, -2, 15, 0);
      ctx.quadraticCurveTo(10, 2, 0, 5);
      ctx.quadraticCurveTo(-10, 8, -15, 0);
      ctx.fillStyle = '#c5c500';
      ctx.fill();
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

    ctx.fillStyle = '#555';
    ctx.font = '11px monospace';
    const aliveCount = fighters.filter((f) => f.alive).length;
    ctx.textAlign = 'left';
    ctx.fillText(`Alive: ${aliveCount}/${fighters.length}`, 12, ARENA_HEIGHT - 12);

    const snapshots: FighterSnapshot[] = fighters.map((f) => ({
      id: f.id,
      weapon: f.weapon,
      hp: f.hp,
      maxHp: f.maxHp,
      x: f.body.position.x,
      y: f.body.position.y,
      alive: f.alive,
      superReady: f.weaponState.superReady,
      superActive: f.weaponState.superActive,
      hitCount: f.weaponState.hitCount,
    }));
    setFighterSnapshots(snapshots);

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
