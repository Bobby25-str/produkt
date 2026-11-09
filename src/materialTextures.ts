import * as THREE from 'three';

// Decorative surface maps only: TEST material properties and calculations stay unchanged.
export function createMaterialTextures(renderer: THREE.WebGLRenderer) {
  const textures: THREE.CanvasTexture[] = [];
  function texture(paint: (ctx: CanvasRenderingContext2D) => void) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    paint(ctx);
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    textures.push(map);
    return map;
  }
  const brick = texture(ctx => {
    ctx.fillStyle = '#d9d3c9';
    ctx.fillRect(0, 0, 512, 512);
    for (let row = 0; row < 8; row++) {
      for (let col = -1; col < 5; col++) {
        const x = col * 128 + (row % 2 ? 64 : 0);
        const y = row * 64;
        const tone = 158 + Math.round(12 * Math.sin(row * 13 + col * 7));
        ctx.fillStyle = `rgb(${tone + 38},${tone + 12},${tone - 5})`;
        ctx.fillRect(x + 3, y + 3, 122, 58);
        ctx.fillStyle = '#ffffff20';
        ctx.fillRect(x + 4, y + 4, 120, 2);
        ctx.fillStyle = '#54413424';
        ctx.fillRect(x + 4, y + 59, 120, 2);
      }
    }
    for (let i = 0; i < 9000; i++) {
      const x = (i * 127.13) % 512, y = (i * 83.71) % 512;
      ctx.fillStyle = i % 2 ? '#ffffff12' : '#503e2a10';
      ctx.fillRect(x, y, 1, 1);
    }
  });
  const wood = texture(ctx => {
    ctx.fillStyle = '#c8a57c';
    ctx.fillRect(0, 0, 512, 512);
    for (let x = 0; x < 512; x++) {
      const tone = Math.round(146 + 18 * Math.sin(x * .072) + 9 * Math.sin(x * .71));
      ctx.strokeStyle = `rgba(${tone + 34},${tone},${tone - 40},.42)`;
      ctx.beginPath();
      for (let y = 0; y <= 512; y += 8) {
        const offset = Math.sin(y * .018 + x * .026) * 2.5;
        if (y === 0) ctx.moveTo(x + offset, y); else ctx.lineTo(x + offset, y);
      }
      ctx.stroke();
    }
    for (let x = 0; x < 512; x += 128) {
      ctx.fillStyle = '#6a4d3530';ctx.fillRect(x, 0, 2, 512);
      ctx.fillStyle = '#fff0d730';ctx.fillRect(x + 2, 0, 1, 512);
    }
  });
  return { brick, wood, dispose: () => textures.forEach(t => t.dispose()) };
}

// UV coordinates use physical dimensions, so resizing never stretches the brickwork.
export function surfaceUVs(geometry: THREE.BoxGeometry, x: number, y: number, z: number, kind: 'brick' | 'wood') {
  const positions = geometry.getAttribute('position'), normals = geometry.getAttribute('normal');
  const uv = geometry.getAttribute('uv');
  const tileWidth = kind === 'brick' ? 1.04 : .8;
  const tileHeight = kind === 'brick' ? .52 : 2;
  for (let i = 0; i < positions.count; i++) {
    const px = positions.getX(i) + x, py = positions.getY(i) + y, pz = positions.getZ(i) + z;
    const nx = Math.abs(normals.getX(i)), ny = Math.abs(normals.getY(i));
    uv.setXY(i, (nx > .5 ? pz : px) / tileWidth, (ny > .5 ? pz : py) / tileHeight);
  }
  uv.needsUpdate = true;
}
