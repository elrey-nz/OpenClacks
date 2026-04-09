// Pixel art sprites for weapons (16x16 grids)
// Each sprite is defined as a 2D array of color indices

type SpriteColor = string | null;

export interface WeaponSprite {
  width: number;
  height: number;
  pixels: (SpriteColor)[][];
  // Pivot point offset from center (in pixels) - where the weapon rotates around
  pivotX?: number;
  pivotY?: number;
}

// Color palettes for each weapon
const COLORS = {
  sword: {
    blade: '#C0C0C0',
    bladeLight: '#E8E8E8',
    bladeDark: '#808080',
    hilt: '#8B4513',
    hiltDark: '#5D2E0C',
    hiltLight: '#A0522D',
    gem: '#FF0000',
    gemLight: '#FF6666',
  },
  shield: {
    face: '#4169E1',
    faceLight: '#6495ED',
    faceDark: '#2F4F8F',
    border: '#DAA520',
    borderLight: '#FFD700',
    borderDark: '#B8860B',
    emblem: '#FFD700',
    emblemLight: '#FFEC8B',
  },
  bow: {
    wood: '#8B4513',
    woodLight: '#A0522D',
    woodDark: '#5D2E0C',
    string: '#F5F5DC',
    grip: '#2F1810',
  },
  arrow: {
    shaft: '#8B4513',
    head: '#C0C0C0',
    headLight: '#E8E8E8',
    headDark: '#808080',
    fletchRed: '#FF0000',
    fletchWhite: '#FFFFFF',
  },
};

// Sword sprite (16x16) - diagonal blade pointing up-right
// Pivot is at the hilt (bottom-left area of the sprite)
export const SWORD_SPRITE: WeaponSprite = {
  width: 16,
  height: 16,
  pivotX: -3, // Offset from center towards the hilt
  pivotY: 4,  // Offset from center towards the hilt
  pixels: [
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null, COLORS.sword.bladeLight, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, COLORS.sword.bladeLight, COLORS.sword.blade, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, COLORS.sword.bladeLight, COLORS.sword.blade, COLORS.sword.bladeDark, null],
    [null, null, null, null, null, null, null, null, null, null, null, COLORS.sword.bladeLight, COLORS.sword.blade, COLORS.sword.bladeDark, null, null],
    [null, null, null, null, null, null, null, null, null, null, COLORS.sword.bladeLight, COLORS.sword.blade, COLORS.sword.bladeDark, null, null, null],
    [null, null, null, null, null, null, null, null, null, COLORS.sword.bladeLight, COLORS.sword.blade, COLORS.sword.bladeDark, null, null, null, null],
    [null, null, null, null, null, null, null, null, COLORS.sword.bladeLight, COLORS.sword.blade, COLORS.sword.bladeDark, null, null, null, null, null],
    [null, null, null, null, null, null, null, COLORS.sword.bladeLight, COLORS.sword.blade, COLORS.sword.bladeDark, null, null, null, null, null, null],
    [null, null, null, null, null, null, COLORS.sword.gemLight, COLORS.sword.gem, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, COLORS.sword.hiltLight, COLORS.sword.hilt, COLORS.sword.hiltDark, null, null, null, null, null, null, null],
    [null, null, null, null, null, COLORS.sword.hiltLight, COLORS.sword.hilt, COLORS.sword.hilt, COLORS.sword.hiltDark, null, null, null, null, null, null, null],
    [null, null, null, null, COLORS.sword.hiltLight, COLORS.sword.hilt, COLORS.sword.hilt, COLORS.sword.hilt, COLORS.sword.hiltDark, null, null, null, null, null, null, null],
    [null, null, null, COLORS.sword.hiltLight, COLORS.sword.hilt, COLORS.sword.hilt, COLORS.sword.hilt, COLORS.sword.hiltDark, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
  ],
};

// Shield sprite (16x16) - classic heater shield shape
// Pivot is at center of shield
export const SHIELD_SPRITE: WeaponSprite = {
  width: 16,
  height: 16,
  pivotX: 0, // Centered
  pivotY: 0, // Centered
  pixels: [
    [null, null, null, null, null, null, COLORS.shield.borderLight, COLORS.shield.borderLight, COLORS.shield.borderLight, COLORS.shield.borderLight, COLORS.shield.borderLight, COLORS.shield.borderLight, null, null, null, null],
    [null, null, null, null, null, COLORS.shield.borderLight, COLORS.shield.faceLight, COLORS.shield.faceLight, COLORS.shield.faceLight, COLORS.shield.faceLight, COLORS.shield.faceLight, COLORS.shield.border, null, null, null],
    [null, null, null, null, COLORS.shield.borderLight, COLORS.shield.faceLight, COLORS.shield.faceLight, COLORS.shield.faceLight, COLORS.shield.faceLight, COLORS.shield.faceLight, COLORS.shield.face, COLORS.shield.border, null, null, null],
    [null, null, null, COLORS.shield.borderLight, COLORS.shield.faceLight, COLORS.shield.faceLight, COLORS.shield.emblem, COLORS.shield.emblemLight, COLORS.shield.emblem, COLORS.shield.faceLight, COLORS.shield.face, COLORS.shield.faceDark, COLORS.shield.border, null, null],
    [null, null, COLORS.shield.borderLight, COLORS.shield.faceLight, COLORS.shield.faceLight, COLORS.shield.emblem, COLORS.shield.emblem, COLORS.shield.emblemLight, COLORS.shield.emblem, COLORS.shield.faceLight, COLORS.shield.face, COLORS.shield.faceDark, COLORS.shield.borderDark, null, null],
    [null, null, COLORS.shield.border, COLORS.shield.faceLight, COLORS.shield.faceLight, COLORS.shield.emblem, COLORS.shield.emblem, COLORS.shield.emblemLight, COLORS.shield.emblem, COLORS.shield.faceLight, COLORS.shield.face, COLORS.shield.faceDark, COLORS.shield.borderDark, null, null],
    [null, null, COLORS.shield.border, COLORS.shield.face, COLORS.shield.faceLight, COLORS.shield.emblem, COLORS.shield.emblem, COLORS.shield.emblemLight, COLORS.shield.emblem, COLORS.shield.faceLight, COLORS.shield.face, COLORS.shield.faceDark, COLORS.shield.borderDark, null, null],
    [null, null, COLORS.shield.border, COLORS.shield.face, COLORS.shield.face, COLORS.shield.emblem, COLORS.shield.emblem, COLORS.shield.emblemLight, COLORS.shield.emblem, COLORS.shield.face, COLORS.shield.faceDark, COLORS.shield.faceDark, COLORS.shield.borderDark, null, null],
    [null, null, null, COLORS.shield.border, COLORS.shield.face, COLORS.shield.faceLight, COLORS.shield.emblem, COLORS.shield.emblemLight, COLORS.shield.emblem, COLORS.shield.face, COLORS.shield.faceDark, COLORS.shield.borderDark, null, null, null],
    [null, null, null, COLORS.shield.border, COLORS.shield.face, COLORS.shield.face, COLORS.shield.faceLight, COLORS.shield.emblem, COLORS.shield.faceLight, COLORS.shield.face, COLORS.shield.faceDark, COLORS.shield.borderDark, null, null, null],
    [null, null, null, null, COLORS.shield.border, COLORS.shield.face, COLORS.shield.face, COLORS.shield.faceLight, COLORS.shield.face, COLORS.shield.faceDark, COLORS.shield.faceDark, COLORS.shield.borderDark, null, null, null],
    [null, null, null, null, COLORS.shield.border, COLORS.shield.faceDark, COLORS.shield.face, COLORS.shield.face, COLORS.shield.face, COLORS.shield.faceDark, COLORS.shield.borderDark, COLORS.shield.borderDark, null, null, null],
    [null, null, null, null, null, COLORS.shield.border, COLORS.shield.faceDark, COLORS.shield.faceDark, COLORS.shield.faceDark, COLORS.shield.faceDark, COLORS.shield.borderDark, null, null, null, null],
    [null, null, null, null, null, null, COLORS.shield.borderDark, COLORS.shield.borderDark, COLORS.shield.borderDark, COLORS.shield.borderDark, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
  ],
};

// Bow sprite (16x16) - curved bow with string (wood on left, string on right)
// Pivot is at the center/grip
export const BOW_SPRITE: WeaponSprite = {
  width: 16,
  height: 16,
  pivotX: 0, // Centered horizontally
  pivotY: 0, // Centered vertically (grip is in middle)
  pixels: [
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, COLORS.bow.string],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null, COLORS.bow.woodLight, COLORS.bow.string],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, COLORS.bow.woodLight, COLORS.bow.wood, COLORS.bow.string],
    [null, null, null, null, null, null, null, null, null, null, null, null, COLORS.bow.woodLight, COLORS.bow.wood, COLORS.bow.woodDark, COLORS.bow.string],
    [null, null, null, null, null, null, null, null, null, null, null, COLORS.bow.woodLight, COLORS.bow.wood, COLORS.bow.woodDark, null, COLORS.bow.string],
    [null, null, null, null, null, null, null, null, null, null, COLORS.bow.woodLight, COLORS.bow.wood, COLORS.bow.woodDark, null, null, COLORS.bow.string],
    [null, null, null, null, null, null, null, null, null, COLORS.bow.woodLight, COLORS.bow.wood, COLORS.bow.woodDark, null, null, null, COLORS.bow.string],
    [null, null, null, null, null, null, null, null, COLORS.bow.woodLight, COLORS.bow.wood, COLORS.bow.woodDark, null, null, null, null, COLORS.bow.string],
    [null, null, null, null, null, null, null, COLORS.bow.woodLight, COLORS.bow.wood, COLORS.bow.woodDark, null, null, null, null, null, COLORS.bow.string],
    [null, null, null, null, null, null, COLORS.bow.grip, COLORS.bow.wood, COLORS.bow.woodDark, null, null, null, null, null, null, COLORS.bow.string],
    [null, null, null, null, null, COLORS.bow.grip, COLORS.bow.wood, COLORS.bow.woodDark, null, null, null, null, null, null, null, COLORS.bow.string],
    [null, null, null, null, COLORS.bow.woodLight, COLORS.bow.wood, COLORS.bow.woodDark, null, null, null, null, null, null, null, null, COLORS.bow.string],
    [null, null, null, COLORS.bow.woodLight, COLORS.bow.wood, COLORS.bow.woodDark, null, null, null, null, null, null, null, null, null, COLORS.bow.string],
    [null, null, COLORS.bow.woodLight, COLORS.bow.wood, COLORS.bow.woodDark, null, null, null, null, null, null, null, null, null, null, COLORS.bow.string],
    [null, COLORS.bow.wood, COLORS.bow.woodDark, null, null, null, null, null, null, null, null, null, null, null, null, COLORS.bow.string],
    [COLORS.bow.woodLight, COLORS.bow.wood, null, null, null, null, null, null, null, null, null, null, null, null, null, COLORS.bow.string],
  ],
};

// Arrow sprite for rendering arrows
export const ARROW_SPRITE = {
  width: 20,
  height: 6,
  pivotX: 0, // Centered
  pivotY: 0, // Centered
  pixels: [
    // Arrow pointing right
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null, COLORS.arrow.headLight, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, COLORS.arrow.headLight, COLORS.arrow.head, COLORS.arrow.headDark, null, null, null, null],
    [COLORS.arrow.fletchWhite, COLORS.arrow.fletchRed, COLORS.arrow.shaft, COLORS.arrow.shaft, COLORS.arrow.shaft, COLORS.arrow.shaft, COLORS.arrow.shaft, COLORS.arrow.shaft, COLORS.arrow.shaft, COLORS.arrow.shaft, COLORS.arrow.shaft, COLORS.arrow.shaft, COLORS.arrow.headLight, COLORS.arrow.head, COLORS.arrow.headDark, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, COLORS.arrow.headLight, COLORS.arrow.head, COLORS.arrow.headDark, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null, COLORS.arrow.headLight, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
  ],
};

export const WEAPON_SPRITES: Record<string, WeaponSprite> = {
  sword: SWORD_SPRITE,
  shield: SHIELD_SPRITE,
  bow: BOW_SPRITE,
};

// Rotation offsets for weapons to point outward
// The sprite is rotated by outwardAngle + offset
// Sprites are designed with their "forward" direction:
// - Sword: points up-right diagonal (45 deg), needs -45 deg to point right
// - Shield: centered, no offset needed
// - Bow: string left, wood right (vertical), needs -90 deg to point right
export const WEAPON_ROTATION_OFFSETS: Record<string, number> = {
  sword: -Math.PI / 4,  // -45 degrees - makes sword point outward
  shield: 0,            // No offset needed for shield
  bow: -Math.PI / 2,    // -90 degrees - makes bow point outward
  arrow: Math.PI,       // 180 degrees - flip arrow to point in direction of travel
};

// Helper function to draw a sprite on canvas
export function drawSprite(
  ctx: CanvasRenderingContext2D,
  sprite: WeaponSprite,
  x: number,
  y: number,
  scale: number = 1,
): void {
  const pixelSize = scale;
  // Use pivot offset if available, otherwise center the sprite
  const pivotOffsetX = (sprite.pivotX ?? 0) * pixelSize;
  const pivotOffsetY = (sprite.pivotY ?? 0) * pixelSize;
  const offsetX = x - (sprite.width * pixelSize) / 2 - pivotOffsetX;
  const offsetY = y - (sprite.height * pixelSize) / 2 - pivotOffsetY;

  for (let row = 0; row < sprite.height; row++) {
    for (let col = 0; col < sprite.width; col++) {
      const color = sprite.pixels[row][col];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(
          offsetX + col * pixelSize,
          offsetY + row * pixelSize,
          pixelSize,
          pixelSize,
        );
      }
    }
  }
}

// Draw sprite rotated around its center
export function drawSpriteRotated(
  ctx: CanvasRenderingContext2D,
  sprite: WeaponSprite,
  x: number,
  y: number,
  angle: number,
  scale: number = 1,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  drawSprite(ctx, sprite, 0, 0, scale);
  ctx.restore();
}
