import { getAllWeaponBehaviors, WeaponDef } from './weapons';

export type { WeaponDef };

export function getWeaponDefinition(id: string): WeaponDef | undefined {
  const behavior = getAllWeaponBehaviors().find(b => b.id === id);
  return behavior?.def;
}

export function getWeaponOptions(): { value: string; label: string }[] {
  return getAllWeaponBehaviors().map((b) => ({
    value: b.id,
    label: b.def.label,
  }));
}

export function hasAttachedWeapon(def: WeaponDef): boolean {
  return def.hasBody;
}
