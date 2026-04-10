import { useState } from 'react';
import { FighterConfig, WeaponType } from '../types';
import { FIGHTER_COLORS } from '../physics/constants';
import { getWeaponOptions } from '../physics/weaponRegistry';

interface SetupScreenProps {
  onStart: (configs: FighterConfig[]) => void;
}

const WEAPON_OPTIONS = getWeaponOptions();

export function SetupScreen({ onStart }: SetupScreenProps) {
  const [fighterCount, setFighterCount] = useState(2);
  const [weapons, setWeapons] = useState<WeaponType[]>(['unarmed', 'unarmed']);

  const updateWeapon = (index: number, weapon: WeaponType) => {
    setWeapons((prev) => {
      const next = [...prev];
      next[index] = weapon;
      return next;
    });
  };

  const addFighter = () => {
    if (fighterCount >= 4) return;
    setFighterCount((c) => c + 1);
    setWeapons((w) => [...w, 'unarmed']);
  };

  const removeFighter = () => {
    if (fighterCount <= 2) return;
    setFighterCount((c) => c - 1);
    setWeapons((w) => w.slice(0, -1));
  };

  const handleStart = () => {
    const configs: FighterConfig[] = weapons.slice(0, fighterCount).map((weapon, i) => ({
      id: `fighter-${i}`,
      weapon,
    }));
    onStart(configs);
  };

  return (
    <div className="setup-screen">
      <h1 className="setup-title">OpenClacks</h1>
      <p className="setup-subtitle">Physics Battle Simulator</p>

      <div className="fighter-slots">
        {Array.from({ length: fighterCount }).map((_, i) => (
          <div key={i} className="fighter-slot">
            <div
              className="fighter-color-dot"
              style={{ backgroundColor: FIGHTER_COLORS[i] }}
            />
            <span className="fighter-label">Fighter {i + 1}</span>
            <select
              value={weapons[i]}
              onChange={(e) => updateWeapon(i, e.target.value as WeaponType)}
              className="weapon-select"
            >
              {WEAPON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="fighter-count-controls">
        <button onClick={removeFighter} disabled={fighterCount <= 2} className="btn-count">
          -
        </button>
        <span className="fighter-count-label">{fighterCount} Fighters</span>
        <button onClick={addFighter} disabled={fighterCount >= 4} className="btn-count">
          +
        </button>
      </div>

      <button onClick={handleStart} className="btn-start">
        Start Match
      </button>
    </div>
  );
}
