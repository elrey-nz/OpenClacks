import { WeaponBehavior } from './WeaponBase';
import { SwordBehavior } from './Sword';
import { DaggerBehavior } from './Dagger';
import { SpearBehavior } from './Spear';
import { BowBehavior } from './Bow';
import { ScytheBehavior } from './Scythe';
import { ShieldBehavior } from './Shield';
import { ScepterBehavior } from './Scepter';
import { UnarmedBehavior } from './Unarmed';
import { BootsBehavior } from './Boots';
import { StaffBehavior } from './Staff';
import { ShurikenBehavior } from './Shuriken';
import { FlaskBehavior } from './Flask';
import { WrenchBehavior } from './Wrench';
import { HammerBehavior } from './Hammer';
import { KatanaBehavior } from './Katana';
import { LanceBehavior } from './Lance';
import { GrimoireBehavior } from './Grimoire';
import { AxeBehavior } from './Axe';
import { BoomerangBehavior } from './Boomerang';
import { FlailBehavior } from './Flail';
import { CrossbowBehavior } from './Crossbow';
import { TorchBehavior } from './Torch';
import { RapierBehavior } from './Rapier';
import { ScrollBehavior } from './Scroll';

const behaviors: WeaponBehavior[] = [
  new SwordBehavior(),
  new DaggerBehavior(),
  new SpearBehavior(),
  new BowBehavior(),
  new ScytheBehavior(),
  new ShieldBehavior(),
  new ScepterBehavior(),
  new UnarmedBehavior(),
  new BootsBehavior(),
  new StaffBehavior(),
  new ShurikenBehavior(),
  new FlaskBehavior(),
  new WrenchBehavior(),
  new HammerBehavior(),
  new KatanaBehavior(),
  new LanceBehavior(),
  new GrimoireBehavior(),
  new AxeBehavior(),
  new BoomerangBehavior(),
  new FlailBehavior(),
  new CrossbowBehavior(),
  new TorchBehavior(),
  new RapierBehavior(),
  new ScrollBehavior(),
];

const registry = new Map<string, WeaponBehavior>();
for (const b of behaviors) registry.set(b.id, b);

export function getWeaponBehavior(id: string): WeaponBehavior | undefined {
  return registry.get(id);
}

export function getAllWeaponBehaviors(): WeaponBehavior[] {
  return behaviors;
}

export { WeaponBehavior };
export type { WeaponDef, HitContext, UpdateContext } from './WeaponBase';
export { makeDummyGameState } from './WeaponBase';
