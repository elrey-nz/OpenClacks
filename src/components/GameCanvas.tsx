import { useRef } from 'react';
import { FighterConfig } from '../types';
import { ARENA_WIDTH, ARENA_HEIGHT, FIGHTER_COLORS } from '../physics/constants';
import { usePhysicsEngine } from '../hooks/usePhysicsEngine';
import { HealthBar } from './HealthBar';

interface GameCanvasProps {
  fighterConfigs: FighterConfig[];
  superMode: boolean;
  onGameOver: (winnerId: string) => void;
}

export function GameCanvas({ fighterConfigs, superMode, onGameOver }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { fighterSnapshots } = usePhysicsEngine(
    canvasRef,
    fighterConfigs,
    true,
    superMode,
    onGameOver,
  );

  return (
    <div className="game-canvas-container">
      <canvas
        ref={canvasRef}
        width={ARENA_WIDTH}
        height={ARENA_HEIGHT}
        className="game-canvas"
      />
      <div className="hud-overlay">
        {fighterSnapshots.map((f, i) => (
          <HealthBar
            key={f.id}
            x={f.x}
            y={f.y}
            hp={f.hp}
            maxHp={f.maxHp}
            alive={f.alive}
            color={FIGHTER_COLORS[i % FIGHTER_COLORS.length]}
          />
        ))}
      </div>
    </div>
  );
}
