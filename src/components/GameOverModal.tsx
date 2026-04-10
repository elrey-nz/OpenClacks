import { FighterConfig } from '../types';
import { FIGHTER_COLORS } from '../physics/constants';
import { getWeaponDefinition } from '../physics/weaponRegistry';

interface GameOverModalProps {
  winnerId: string;
  fighterConfigs: FighterConfig[];
  onPlayAgain: () => void;
}

export function GameOverModal({ winnerId, fighterConfigs, onPlayAgain }: GameOverModalProps) {
  const winnerIndex = fighterConfigs.findIndex((c) => c.id === winnerId);
  const winner = fighterConfigs[winnerIndex];
  const winnerColor = FIGHTER_COLORS[winnerIndex % FIGHTER_COLORS.length];
  const weaponDef = getWeaponDefinition(winner?.weapon ?? 'unarmed');
  const weaponColor = weaponDef?.color ?? '#888';

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Match Over</h2>
        <div className="winner-badge" style={{ borderColor: winnerColor }}>
          <div
            className="winner-dot"
            style={{ backgroundColor: winnerColor }}
          />
          <span className="winner-name">
            Fighter {winnerIndex + 1}
          </span>
          <span
            className="winner-weapon"
            style={{ color: weaponColor }}
          >
            {winner?.weapon ?? 'Unknown'}
          </span>
        </div>
        <p className="winner-label">Wins!</p>
        <button onClick={onPlayAgain} className="btn-play-again">
          Play Again
        </button>
      </div>
    </div>
  );
}
