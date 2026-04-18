import { useState, useCallback } from 'react';
import { GamePhase, FighterConfig } from './types';
import { SetupScreen } from './components/SetupScreen';
import { GameCanvas } from './components/GameCanvas';
import { GameOverModal } from './components/GameOverModal';
import './App.css';

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [fighterConfigs, setFighterConfigs] = useState<FighterConfig[]>([]);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [superMode, setSuperMode] = useState(false);

  const handleStart = useCallback((configs: FighterConfig[], sm: boolean) => {
    setFighterConfigs(configs);
    setSuperMode(sm);
    setWinnerId(null);
    setPhase('playing');
  }, []);

  const handleGameOver = useCallback((wid: string) => {
    setWinnerId(wid);
    setPhase('gameover');
  }, []);

  const handlePlayAgain = useCallback(() => {
    setFighterConfigs([]);
    setWinnerId(null);
    setPhase('setup');
  }, []);

  return (
    <div className="app">
      {phase === 'setup' && <SetupScreen onStart={handleStart} />}

      {phase === 'playing' && fighterConfigs.length > 0 && (
        <GameCanvas
          fighterConfigs={fighterConfigs}
          superMode={superMode}
          onGameOver={handleGameOver}
        />
      )}

      {phase === 'gameover' && winnerId && (
        <>
          <GameCanvas
            fighterConfigs={fighterConfigs}
            superMode={superMode}
            onGameOver={handleGameOver}
          />
          <GameOverModal
            winnerId={winnerId}
            fighterConfigs={fighterConfigs}
            onPlayAgain={handlePlayAgain}
          />
        </>
      )}
    </div>
  );
}
