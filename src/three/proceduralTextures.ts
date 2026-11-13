import * as THREE from 'three';

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  return [canvas, ctx];
}

function finalizeColorTexture(
  canvas: HTMLCanvasElement,
  anisotropy: number,
  repeatX = 1,
  repeatY = 1
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = anisotropy;
  if (repeatX !== 1 || repeatY !== 1) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
  }
  tex.needsUpdate = true;
  return tex;
}

/**
 * Face texture for the sad man:
 * - Weathered skin tone
 * - Pronounced dark under-eye circles (ojeras)
 * - Heavy drooping brow & tired sad mouth (NO cheerful poster smile)
 * - Beard stubble blending into the 3D sculpted beard
 */
export function createSadFaceTexture(anisotropy: number): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(512, 512);

  // Base weathered skin tone
  const skinGrad = ctx.createRadialGradient(256, 230, 30, 256, 256, 280);
  skinGrad.addColorStop(0, '#c79c82');
  skinGrad.addColorStop(0.6, '#b1856b');
  skinGrad.addColorStop(1, '#8c644e');
  ctx.fillStyle = skinGrad;
  ctx.fillRect(0, 0, 512, 512);

  // Subtle weathered skin mottling & pores
  for (let i = 0; i < 900; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(95,62,48,0.08)' : 'rgba(225,186,162,0.06)';
    ctx.fillRect(x, y, 2, 2);
  }

  // Forehead worry lines (horizontal creases)
  ctx.strokeStyle = 'rgba(72, 44, 34, 0.35)';
  ctx.lineWidth = 2.4;
  for (let i = 0; i < 3; i++) {
    const y = 148 + i * 13;
    ctx.beginPath();
    ctx.moveTo(192, y + 4);
    ctx.quadraticCurveTo(256, y - 5, 320, y + 4);
    ctx.stroke();
  }

  // Vertical frown crease between brows
  ctx.strokeStyle = 'rgba(65, 38, 28, 0.45)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(247, 185);
  ctx.lineTo(249, 214);
  ctx.moveTo(265, 185);
  ctx.lineTo(263, 214);
  ctx.stroke();

  // Heavy dark under-eye circles (OJERAS) - prominent & realistic
  const drawOjera = (cx: number, cy: number) => {
    const g = ctx.createRadialGradient(cx, cy + 12, 4, cx, cy + 10, 38);
    g.addColorStop(0, 'rgba(48, 30, 38, 0.62)');
    g.addColorStop(0.55, 'rgba(64, 42, 48, 0.38)');
    g.addColorStop(1, 'rgba(90, 62, 56, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 11, 34, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye socket shadow
    ctx.fillStyle = 'rgba(54, 36, 36, 0.45)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 24, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tired half-closed eye sclera & dark iris
    ctx.fillStyle = '#ddd4cd';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 1, 15, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2c201b';
    ctx.beginPath();
    ctx.arc(cx, cy + 1, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // Heavy drooping upper eyelid
    ctx.fillStyle = '#996d57';
    ctx.beginPath();
    ctx.ellipse(cx, cy - 5, 17, 7, 0, Math.PI, Math.PI * 2);
    ctx.fill();
  };

  drawOjera(210, 224);
  drawOjera(302, 224);

  // Sad angled eyebrows (inner corner lifted slightly in worry, outer drooping)
  ctx.strokeStyle = '#231b17';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(182, 206);
  ctx.quadraticCurveTo(208, 198, 234, 195);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(330, 206);
  ctx.quadraticCurveTo(304, 198, 278, 195);
  ctx.stroke();

  // Nose bridge shading & nostrils
  ctx.fillStyle = 'rgba(130, 90, 70, 0.25)';
  ctx.beginPath();
  ctx.ellipse(256, 258, 11, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(65, 38, 28, 0.42)';
  ctx.beginPath();
  ctx.ellipse(244, 282, 6, 4, 0, 0, Math.PI * 2);
  ctx.ellipse(268, 282, 6, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nasolabial fatigue lines
  ctx.strokeStyle = 'rgba(72, 44, 34, 0.38)';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(234, 282);
  ctx.quadraticCurveTo(212, 310, 206, 336);
  ctx.moveTo(278, 282);
  ctx.quadraticCurveTo(300, 310, 306, 336);
  ctx.stroke();

  // Unkempt beard stubble & beard base on lower face
  for (let i = 0; i < 3600; i++) {
    const x = 148 + Math.random() * 216;
    const y = 288 + Math.random() * 170;
    const dx = (x - 256) / 108;
    const dy = (y - 348) / 115;
    if (dx * dx + dy * dy <= 1.0) {
      // Leave small opening around downturned lips
      if (Math.abs(x - 256) < 28 && y > 312 && y < 338) continue;
      ctx.fillStyle = Math.random() > 0.35 ? 'rgba(34, 26, 22, 0.65)' : 'rgba(68, 56, 48, 0.45)';
      ctx.fillRect(x, y, 2.2, 3.2);
    }
  }

  // Sad, exhausted downturned mouth (completely different from poster smile)
  ctx.strokeStyle = '#4e2e27';
  ctx.lineWidth = 4.2;
  ctx.beginPath();
  ctx.moveTo(230, 330);
  ctx.quadraticCurveTo(256, 319, 282, 330);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(55, 32, 26, 0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(236, 335);
  ctx.quadraticCurveTo(256, 329, 276, 335);
  ctx.stroke();

  return finalizeColorTexture(canvas, anisotropy);
}

/**
 * Weathered, dirty faded denim shirt texture matching reference photo
 */
export function createDenimTexture(anisotropy: number, isJeans = false): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(512, 512);

  ctx.fillStyle = isJeans ? '#304155' : '#3a4e66';
  ctx.fillRect(0, 0, 512, 512);

  // Diagonal denim twill weave
  ctx.strokeStyle = isJeans ? 'rgba(130, 155, 185, 0.12)' : 'rgba(145, 170, 200, 0.14)';
  ctx.lineWidth = 1;
  for (let i = -512; i < 1024; i += 4) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 512, 512);
    ctx.stroke();
  }

  // Worn lighter creases
  for (let i = 0; i < 18; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const g = ctx.createRadialGradient(x, y, 5, x, y, 45 + Math.random() * 45);
    g.addColorStop(0, 'rgba(145, 165, 190, 0.14)');
    g.addColorStop(1, 'rgba(145, 165, 190, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);
  }

  // Dirt, oil & dust stains
  for (let i = 0; i < 26; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 16 + Math.random() * 48;
    const g = ctx.createRadialGradient(x, y, 2, x, y, r);
    g.addColorStop(0, 'rgba(46, 38, 30, 0.42)');
    g.addColorStop(0.6, 'rgba(65, 54, 42, 0.2)');
    g.addColorStop(1, 'rgba(65, 54, 42, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // Subtle ochre stitching lines
  ctx.strokeStyle = 'rgba(176, 134, 78, 0.45)';
  ctx.setLineDash([5, 3]);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(14, 14, 484, 484);

  return finalizeColorTexture(canvas, anisotropy);
}

/**
 * Faded, slightly stained charcoal t-shirt texture
 */
export function createWornTeeTexture(anisotropy: number): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(256, 256);
  ctx.fillStyle = '#232529';
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 450; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.08)';
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
  }
  // Dust & sweat fade
  for (let i = 0; i < 12; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const g = ctx.createRadialGradient(x, y, 2, x, y, 36);
    g.addColorStop(0, 'rgba(92, 82, 70, 0.28)');
    g.addColorStop(1, 'rgba(92, 82, 70, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
  }

  return finalizeColorTexture(canvas, anisotropy);
}

/**
 * Dirty worn off-white sneaker canvas texture
 */
export function createDirtySneakerTexture(anisotropy: number): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(256, 256);
  ctx.fillStyle = '#c9c2b5';
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 25; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const r = 10 + Math.random() * 34;
    const g = ctx.createRadialGradient(x, y, 2, x, y, r);
    g.addColorStop(0, 'rgba(72, 62, 50, 0.45)');
    g.addColorStop(1, 'rgba(72, 62, 50, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
  }
  return finalizeColorTexture(canvas, anisotropy);
}

/**
 * Aged warm-dark hardwood floor planks
 */
export function createWoodFloorTexture(anisotropy: number): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(512, 512);
  ctx.fillStyle = '#2d241e';
  ctx.fillRect(0, 0, 512, 512);

  const plankCount = 6;
  const plankH = 512 / plankCount;
  for (let p = 0; p < plankCount; p++) {
    const y0 = p * plankH;
    const shade = 34 + (p % 3) * 6;
    ctx.fillStyle = `rgb(${shade + 10}, ${shade + 2}, ${shade - 4})`;
    ctx.fillRect(0, y0 + 1, 512, plankH - 2);

    // Wood grain lines
    ctx.strokeStyle = 'rgba(18, 12, 9, 0.35)';
    ctx.lineWidth = 1.2;
    for (let g = 0; g < 16; g++) {
      const gy = y0 + 4 + Math.random() * (plankH - 8);
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.bezierCurveTo(170, gy + (Math.random() - 0.5) * 6, 340, gy + (Math.random() - 0.5) * 6, 512, gy);
      ctx.stroke();
    }

    // Plank seam
    ctx.fillStyle = '#18120e';
    ctx.fillRect(0, y0, 512, 2);
  }
  return finalizeColorTexture(canvas, anisotropy, 3, 3);
}

/**
 * Matte lived-in plaster wall texture (melancholic warm-grey, NOT horror)
 */
export function createPlasterWallTexture(anisotropy: number): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(512, 512);
  ctx.fillStyle = '#333840';
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 40; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 30 + Math.random() * 70;
    const g = ctx.createRadialGradient(x, y, 5, x, y, r);
    g.addColorStop(0, Math.random() > 0.5 ? 'rgba(65, 70, 78, 0.18)' : 'rgba(32, 36, 42, 0.18)');
    g.addColorStop(1, 'rgba(40, 44, 52, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);
  }
  return finalizeColorTexture(canvas, anisotropy, 2, 2);
}

/**
 * Foggy subtly cracked mirror surface
 */
export function createMirrorTexture(anisotropy: number): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(256, 384);
  const grad = ctx.createLinearGradient(0, 0, 256, 384);
  grad.addColorStop(0, '#5a6573');
  grad.addColorStop(0.5, '#3b434f');
  grad.addColorStop(1, '#262b33');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 384);

  // Subtle diagonal reflection sheen
  ctx.fillStyle = 'rgba(220, 230, 242, 0.08)';
  ctx.beginPath();
  ctx.moveTo(0, 80);
  ctx.lineTo(180, 0);
  ctx.lineTo(256, 0);
  ctx.lineTo(0, 210);
  ctx.closePath();
  ctx.fill();

  // Subtle crack in lower corner
  ctx.strokeStyle = 'rgba(235, 240, 245, 0.52)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(212, 320);
  ctx.lineTo(175, 285);
  ctx.lineTo(155, 248);
  ctx.moveTo(175, 285);
  ctx.lineTo(192, 255);
  ctx.moveTo(212, 320);
  ctx.lineTo(240, 295);
  ctx.stroke();

  return finalizeColorTexture(canvas, anisotropy);
}

export function createClockFaceTexture(anisotropy: number): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(256, 256);
  ctx.fillStyle = '#ddd4c2';
  ctx.beginPath();
  ctx.arc(128, 128, 124, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#332b24';
  ctx.lineWidth = 6;
  ctx.stroke();

  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const r1 = i % 3 === 0 ? 94 : 102;
    const r2 = 114;
    ctx.strokeStyle = '#2b241e';
    ctx.lineWidth = i % 3 === 0 ? 4 : 2;
    ctx.beginPath();
    ctx.moveTo(128 + Math.cos(a) * r1, 128 + Math.sin(a) * r1);
    ctx.lineTo(128 + Math.cos(a) * r2, 128 + Math.sin(a) * r2);
    ctx.stroke();
  }
  return finalizeColorTexture(canvas, anisotropy);
}

export function createPhoneScreenTexture(anisotropy: number): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(256, 512);
  ctx.fillStyle = '#11161f';
  ctx.fillRect(0, 0, 256, 512);

  // Dim clock
  ctx.fillStyle = '#d8dee9';
  ctx.font = 'bold 42px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('11:47', 128, 110);

  // Notification cards
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(22, 175, 212, 68);
  ctx.fillRect(22, 260, 212, 68);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#d99b58';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('3 llamadas perdidas', 36, 204);
  ctx.fillStyle = '#aeb7c4';
  ctx.font = '14px sans-serif';
  ctx.fillText('Casa · Hace 40 min', 36, 226);

  ctx.fillStyle = '#e5e7eb';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('Mensaje sin leer', 36, 289);
  ctx.fillStyle = '#aeb7c4';
  ctx.font = '14px sans-serif';
  ctx.fillText('«¿Todo bien hoy?»', 36, 311);

  return finalizeColorTexture(canvas, anisotropy);
}

export function createBillsTexture(anisotropy: number): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(256, 320);
  ctx.fillStyle = '#e3dccb';
  ctx.fillRect(0, 0, 256, 320);

  ctx.fillStyle = '#994b3d';
  ctx.fillRect(18, 22, 220, 28);
  ctx.fillStyle = '#f4efe4';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('AVISO DE COBRO', 28, 41);

  ctx.fillStyle = '#4a433b';
  for (let i = 0; i < 7; i++) {
    ctx.fillRect(22, 76 + i * 28, 140 + (i % 3) * 28, 6);
  }
  ctx.fillStyle = '#8b3a2e';
  ctx.font = 'bold 18px monospace';
  ctx.fillText('SALDO PENDIENTE', 22, 290);

  return finalizeColorTexture(canvas, anisotropy);
}

export function createContactShadowTexture(): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(256, 256);
  const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 124);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.58)');
  grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.24)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}
