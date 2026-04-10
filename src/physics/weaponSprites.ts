type SpriteColor = string | null;

export interface WeaponSprite {
  width: number;
  height: number;
  pixels: (SpriteColor)[][];
  pivotX?: number;
  pivotY?: number;
}

const C = {
  sword: {
    blade: '#B8C4D0',
    bladeLight: '#DCE4EC',
    bladeDark: '#7A8A9A',
    bladeEdge: '#5A6A7A',
    guard: '#DAA520',
    guardLight: '#FFD700',
    guardDark: '#B8860B',
    grip: '#6B3410',
    gripLight: '#8B4513',
    gripDark: '#4A2208',
    gem: '#E02020',
    gemLight: '#FF6060',
    gemDark: '#A01010',
  },
  shield: {
    face: '#3B6FBF',
    faceLight: '#5A8FDF',
    faceDark: '#2A4F8F',
    rim: '#DAA520',
    rimLight: '#FFD700',
    rimDark: '#B8860B',
    emblem: '#FFD700',
    emblemLight: '#FFEC8B',
    boss: '#C0C0C0',
    bossLight: '#E0E0E0',
  },
  bow: {
    wood: '#7A4015',
    woodLight: '#A05820',
    woodDark: '#502A0A',
    string: '#E8E0D0',
    grip: '#3A1A08',
    gripWrap: '#5A3018',
  },
  arrow: {
    shaft: '#9A6830',
    shaftLight: '#B88040',
    head: '#C0C8D0',
    headLight: '#E0E8F0',
    headDark: '#808890',
    fletch: '#CC2020',
    fletchLight: '#FF5050',
  },
};

export const SWORD_SPRITE: WeaponSprite = {
  width: 16,
  height: 16,
  pivotX: -3,
  pivotY: 4,
  pixels: [
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null, C.sword.bladeLight, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, C.sword.bladeLight, C.sword.blade, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, C.sword.bladeLight, C.sword.blade, C.sword.bladeDark, null],
    [null, null, null, null, null, null, null, null, null, null, null, C.sword.bladeLight, C.sword.blade, C.sword.bladeDark, null, null],
    [null, null, null, null, null, null, null, null, null, null, C.sword.bladeLight, C.sword.blade, C.sword.bladeDark, null, null, null],
    [null, null, null, null, null, null, null, null, null, C.sword.bladeLight, C.sword.blade, C.sword.bladeDark, null, null, null, null],
    [null, null, null, null, null, null, null, null, C.sword.bladeLight, C.sword.blade, C.sword.bladeDark, null, null, null, null, null],
    [null, null, null, null, null, null, null, C.sword.bladeLight, C.sword.blade, C.sword.bladeDark, null, null, null, null, null, null],
    [null, null, null, null, null, null, C.sword.guardDark, C.sword.guard, C.sword.guard, C.sword.guard, C.sword.guardDark, null, null, null, null, null],
    [null, null, null, null, C.sword.guardDark, C.sword.guardLight, C.sword.guard, C.sword.guard, C.sword.guard, C.sword.guard, C.sword.guardLight, C.sword.guardDark, null, null, null, null],
    [null, null, null, null, null, null, C.sword.gripDark, C.sword.grip, C.sword.gripLight, C.sword.gripDark, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, C.sword.grip, C.sword.gripLight, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, C.sword.gripDark, C.sword.grip, C.sword.gripLight, C.sword.gripDark, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, C.sword.gemDark, C.sword.gem, C.sword.gemLight, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
  ],
};

export const SHIELD_SPRITE: WeaponSprite = {
  width: 16,
  height: 16,
  pivotX: 0,
  pivotY: 0,
  pixels: [
    [null, null, null, null, null, C.shield.rimLight, C.shield.rimLight, C.shield.rimLight, C.shield.rimLight, C.shield.rimLight, C.shield.rimLight, null, null, null, null, null],
    [null, null, null, null, C.shield.rimLight, C.shield.faceLight, C.shield.faceLight, C.shield.faceLight, C.shield.faceLight, C.shield.faceLight, C.shield.rim, C.shield.rimDark, null, null, null, null],
    [null, null, null, C.shield.rimLight, C.shield.faceLight, C.shield.faceLight, C.shield.faceLight, C.shield.faceLight, C.shield.faceLight, C.shield.faceLight, C.shield.face, C.shield.rim, C.shield.rimDark, null, null, null],
    [null, null, C.shield.rimLight, C.shield.faceLight, C.shield.faceLight, C.shield.faceLight, C.shield.faceLight, C.shield.faceLight, C.shield.faceLight, C.shield.face, C.shield.face, C.shield.faceDark, C.shield.rimDark, null, null, null],
    [null, null, C.shield.rim, C.shield.faceLight, C.shield.faceLight, C.shield.emblem, C.shield.emblemLight, C.shield.emblem, C.shield.faceLight, C.shield.face, C.shield.face, C.shield.faceDark, C.shield.rimDark, null, null, null],
    [null, null, C.shield.rim, C.shield.faceLight, C.shield.emblem, C.shield.emblemLight, C.shield.bossLight, C.shield.emblemLight, C.shield.emblem, C.shield.face, C.shield.faceDark, C.shield.faceDark, C.shield.rimDark, null, null, null],
    [null, null, C.shield.rim, C.shield.face, C.shield.emblemLight, C.shield.bossLight, C.shield.boss, C.shield.emblemLight, C.shield.emblem, C.shield.face, C.shield.faceDark, C.shield.faceDark, C.shield.rimDark, null, null, null],
    [null, null, C.shield.rim, C.shield.face, C.shield.emblem, C.shield.emblemLight, C.shield.emblemLight, C.shield.emblem, C.shield.emblem, C.shield.face, C.shield.faceDark, C.shield.faceDark, C.shield.rimDark, null, null, null],
    [null, null, null, C.shield.rim, C.shield.face, C.shield.emblem, C.shield.emblem, C.shield.emblem, C.shield.emblem, C.shield.face, C.shield.faceDark, C.shield.rimDark, null, null, null, null],
    [null, null, null, C.shield.rim, C.shield.face, C.shield.face, C.shield.emblem, C.shield.emblem, C.shield.face, C.shield.faceDark, C.shield.faceDark, C.shield.rimDark, null, null, null, null],
    [null, null, null, null, C.shield.rim, C.shield.face, C.shield.face, C.shield.face, C.shield.face, C.shield.faceDark, C.shield.rimDark, C.shield.rimDark, null, null, null, null],
    [null, null, null, null, C.shield.rim, C.shield.faceDark, C.shield.face, C.shield.face, C.shield.faceDark, C.shield.faceDark, C.shield.rimDark, null, null, null, null, null],
    [null, null, null, null, null, C.shield.rim, C.shield.faceDark, C.shield.faceDark, C.shield.faceDark, C.shield.rimDark, C.shield.rimDark, null, null, null, null, null],
    [null, null, null, null, null, null, C.shield.rimDark, C.shield.rimDark, C.shield.rimDark, C.shield.rimDark, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
  ],
};

export const BOW_SPRITE: WeaponSprite = {
  width: 16,
  height: 16,
  pivotX: 0,
  pivotY: 0,
  pixels: [
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, C.bow.string],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null, C.bow.woodLight, C.bow.string],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, C.bow.woodLight, C.bow.wood, C.bow.string],
    [null, null, null, null, null, null, null, null, null, null, null, null, C.bow.woodLight, C.bow.wood, C.bow.woodDark, C.bow.string],
    [null, null, null, null, null, null, null, null, null, null, null, C.bow.woodLight, C.bow.wood, C.bow.woodDark, null, C.bow.string],
    [null, null, null, null, null, null, null, null, null, null, C.bow.woodLight, C.bow.wood, C.bow.woodDark, null, null, C.bow.string],
    [null, null, null, null, null, null, null, null, null, C.bow.woodLight, C.bow.wood, C.bow.woodDark, null, null, null, C.bow.string],
    [null, null, null, null, null, null, null, null, C.bow.woodLight, C.bow.wood, C.bow.woodDark, null, null, null, null, C.bow.string],
    [null, null, null, null, null, null, null, C.bow.woodLight, C.bow.wood, C.bow.woodDark, null, null, null, null, null, C.bow.string],
    [null, null, null, null, null, null, C.bow.grip, C.bow.wood, C.bow.woodDark, null, null, null, null, null, null, C.bow.string],
    [null, null, null, null, null, C.bow.gripWrap, C.bow.wood, C.bow.woodDark, null, null, null, null, null, null, null, C.bow.string],
    [null, null, null, null, C.bow.woodLight, C.bow.wood, C.bow.woodDark, null, null, null, null, null, null, null, null, C.bow.string],
    [null, null, null, C.bow.woodLight, C.bow.wood, C.bow.woodDark, null, null, null, null, null, null, null, null, null, C.bow.string],
    [null, null, C.bow.woodLight, C.bow.wood, C.bow.woodDark, null, null, null, null, null, null, null, null, null, null, C.bow.string],
    [null, C.bow.woodLight, C.bow.wood, C.bow.woodDark, null, null, null, null, null, null, null, null, null, null, null, C.bow.string],
    [C.bow.woodLight, C.bow.wood, null, null, null, null, null, null, null, null, null, null, null, null, null, C.bow.string],
  ],
};

export const ARROW_SPRITE = {
  width: 14,
  height: 5,
  pivotX: 0,
  pivotY: 0,
  pixels: [
    [null, null, null, null, null, null, null, null, null, null, null, C.arrow.headLight, null, null],
    [null, null, null, null, null, null, null, null, null, null, C.arrow.headLight, C.arrow.head, C.arrow.headDark, null],
    [C.arrow.fletchLight, C.arrow.fletch, C.arrow.shaft, C.arrow.shaftLight, C.arrow.shaft, C.arrow.shaft, C.arrow.shaft, C.arrow.shaft, C.arrow.shaftLight, C.arrow.shaft, C.arrow.headLight, C.arrow.head, C.arrow.headDark, null],
    [null, null, null, null, null, null, null, null, null, null, C.arrow.headLight, C.arrow.head, C.arrow.headDark, null],
    [null, null, null, null, null, null, null, null, null, null, null, C.arrow.headLight, null, null],
  ],
};

export const WEAPON_SPRITES: Record<string, WeaponSprite> = {
  sword: SWORD_SPRITE,
  shield: SHIELD_SPRITE,
  bow: BOW_SPRITE,
};

export const WEAPON_ROTATION_OFFSETS: Record<string, number> = {
  sword: -Math.PI / 4,
  shield: 0,
  bow: -Math.PI / 2,
  arrow: Math.PI,
};

export function drawSprite(
  ctx: CanvasRenderingContext2D,
  sprite: WeaponSprite,
  x: number,
  y: number,
  scale: number = 1,
): void {
  const pixelSize = scale;
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
