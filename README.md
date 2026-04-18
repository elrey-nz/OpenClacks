# OpenClacks

A 2D physics-based arena battle simulator. Fighters are balls equipped with weapons that spin, collide, and scale in power over the course of a match. Built with React, TypeScript, and Matter.js.

## Getting Started

```bash
npm install
npm run dev
```

Open the local dev server in your browser. Pick weapons for 2–4 fighters and start a match.

## How It Works

Fighters are physics bodies that rotate and bounce around a walled arena. Each fighter carries a weapon that collides with opponents, dealing damage and triggering weapon-specific scaling effects. The last fighter standing wins.

### Super Mode

A "Super Mode" toggle on the setup screen forces all fighters into their super state for the entire round. This overrides normal super thresholds and durations.

### Per-Hit Scaling

Almost every weapon grows stronger with each hit — more damage, faster projectiles, bigger area effects, etc. This creates escalating fights where early hits compound into late-game power.

## Weapon Types

| Weapon | Color | Super? | Summary |
|---|---|---|---|
| Sword | Salmon | Yes | +1 damage per hit. Super: 2 rotations/sec, double damage. |
| Dagger | Lime | Yes | +0.1 rad/s rotation per hit. Super: length x5. |
| Spear | Cyan | Yes | +0.5 length and +0.5 damage per hit. Super: centered (both ends), 1.5x rotation. |
| Bow | Yellow | Yes | Fires arrows; +1 arrow per hit. Super: 2x arrows per burst. |
| Scythe | Purple | Yes | Adds permanent poison stacks per hit. Super: second blade on opposite side. |
| Shield | Pirate Gold | Yes | Parries projectiles, +5% width per parry. Super: throwable boomerang shield. |
| Scepter | Light Pink | Yes | +0.5 lifesteal per hit, heals allies. Super: spawns healing boxes on hit. |
| Unarmed | Grey | Yes | +1 max speed per hit, speed-scaled damage. Super: zero friction/gravity. |
| Boots | Grey | No | Like Unarmed but smaller hitbox. Intentionally no super. |
| Staff | Light Blue | Yes | Fires fireballs; +0.5 damage/size per hit. Super: fires two in opposite directions. |
| Shuriken | Olive | Yes | +1 bounce per hit. Super: halved cooldown, +2 bounces per hit. |
| Wrench | Orange | Yes | Spawns turrets on hit. Super: 3-barrel turrets, faster fire, more damage. |
| Hammer | Magenta | Yes | +1 max rotation speed per hit. Super: rotation never resets. |
| Katana | Mint | Yes | Slash counter → tick DOT. Super: two extra blades at 120° offsets. |
| Flask | Green | Yes | Throws spill zones; +DPS per hit. Super: 4x throw rate. |
| Lance | Banana | Yes | +2 joust damage per hit. Super: accurate jousts (tight angular tolerance). |
| Grimoire | Grey | Yes | Spawns minions copying target's weapon. Super: invincible minions. |
| Axe | Dark Red | Yes | +2% crit chance per hit. Super: randomized crit damage (20–100). |
| Boomerang | Pear | Yes | +2 damage per hit. Super: 2x throw rate. |
| Flail | Soft Orange | No | +0.5 size/damage per hit. No super (stub for future). |
| Crossbow | Lime | Yes | +1 bolt damage per hit. Super: ~2.44x fire rate. |
| Torch | Violet | Yes | Spawns flames; +1s lifetime per hit. Super: infinite flames that chase enemies. |
| Rapier | White | No | Lunge attack; +0.2 lunge rate and +1 lunge damage per hit. No super (stub). |
| Scroll | Periwinkle | No | Orbiting letters; +0.2 spawn rate per hit. No super (stub). |

## Project Structure

```
src/
  App.tsx                    # Root component, phase management (setup/playing/gameover)
  App.css                    # All styles
  types.ts                   # Shared TypeScript types
  components/
    SetupScreen.tsx          # Weapon selection, fighter count, super mode toggle
    GameCanvas.tsx           # Canvas + HUD overlay
    GameCanvas.tsx           # Health bar rendering
    GameOverModal.tsx        # Winner display + play again
  hooks/
    usePhysicsEngine.ts      # Main game loop: physics update, rendering, collision cleanup
  physics/
    arena.ts                 # Wall body creation
    constants.ts             # Arena dimensions, fighter colors, weapon scaling constants
    collisions.ts            # Matter.js collision handler (damage, parry, projectiles)
    entities.ts              # Fighter body/constraint creation and removal
    weaponRegistry.ts        # Weapon definition lookup and options list
    weaponSystem.ts          # Super state, turrets, minions, boomerangs, flames, DOTs
    weapons/
      index.ts               # Behavior registry (maps weapon id → behavior instance)
      WeaponBase.ts           # Abstract WeaponBehavior class, WeaponDef interface
      WeaponUtils.ts          # Shared helpers (projectile creation, minion/turret/flame spawning)
      *.ts                    # One file per weapon (Sword.ts, Bow.ts, etc.)
```

### Adding a New Weapon

1. Create `src/physics/weapons/YourWeapon.ts` extending `WeaponBehavior`.
2. Implement `calculateDamage`, `onHitScaling`, and optionally `onAbilityUpdate` / `onSuperEffect`.
3. Register it in `src/physics/weapons/index.ts`.
4. Add scaling constants to `src/physics/constants.ts` if needed.

## Tech Stack

- **React 19** — UI components
- **Matter.js** — 2D physics engine
- **TypeScript** — type safety
- **Vite** — build tooling
