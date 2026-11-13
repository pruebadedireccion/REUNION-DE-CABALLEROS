import * as THREE from 'three';
import { createContactShadowTexture } from './proceduralTextures';

export interface SadManRig {
  group: THREE.Group;
  hitProxies: THREE.Object3D[];
  update: (elapsed: number, camera: THREE.Camera) => void;
  dispose: () => void;
}

export function buildSadMan(anisotropy: number): SadManRig {
  const root = new THREE.Group();
  root.name = 'SadManBillboard360';

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const textures: THREE.Texture[] = [];

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    materials.push(m);
    return m;
  };

  // Contact shadow grounding plane
  const shadowTex = createContactShadowTexture();
  textures.push(shadowTex);

  const contactShadow = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(0.95, 0.75)),
    trackMat(
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        opacity: 0.65,
        depthWrite: false,
      })
    )
  );
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.004;
  root.add(contactShadow);

  // Load transparent WebP character texture (front view aligned at offset 0)
  const spriteTex = new THREE.TextureLoader().load('/assets/sad-man-360.webp');
  spriteTex.colorSpace = THREE.SRGBColorSpace;
  spriteTex.anisotropy = anisotropy;
  spriteTex.wrapS = THREE.ClampToEdgeWrapping;
  spriteTex.wrapT = THREE.ClampToEdgeWrapping;
  spriteTex.minFilter = THREE.LinearMipmapLinearFilter;
  spriteTex.magFilter = THREE.LinearFilter;
  spriteTex.repeat.set(1 / 8, 1);
  spriteTex.offset.set(0, 0);
  textures.push(spriteTex);

  // Static 3D plane dimensions matched to 224x660 sprite aspect ratio (~1.76m figure height)
  const planeHeight = 1.79;
  const planeWidth = planeHeight * (224 / 660);

  const spriteMat = trackMat(
    new THREE.MeshBasicMaterial({
      map: spriteTex,
      transparent: true,
      alphaTest: 0.14,
      color: 0xc8beb2,
      side: THREE.DoubleSide,
    })
  );

  const spritePlane = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(planeWidth, planeHeight)),
    spriteMat
  );
  const baseY = planeHeight / 2 - 0.015;
  spritePlane.position.set(0, baseY, 0);
  root.add(spritePlane);

  // Simplified raycast hit proxies (body -> 'hombre', feet/laces -> 'zapatos')
  const hitProxy = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.28, 0.26, 1.48, 10)),
    trackMat(new THREE.MeshBasicMaterial({ visible: false }))
  );
  hitProxy.position.set(0, 0.98, 0);
  hitProxy.userData.objectId = 'hombre';
  root.add(hitProxy);

  const shoeHitProxy = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.52, 0.22, 0.45)),
    trackMat(new THREE.MeshBasicMaterial({ visible: false }))
  );
  shoeHitProxy.position.set(0, 0.11, 0);
  shoeHitProxy.userData.objectId = 'zapatos';
  root.add(shoeHitProxy);

  return {
    group: root,
    hitProxies: [hitProxy, shoeHitProxy],
    update: () => {
      // Static sprite grounded in 3D space
    },
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
    },
  };
}

/**
 * InstancedMesh cluster of cigarette butts scattered on the floor around the man's sneakers
 */
export function buildCigaretteButtsCluster(
  centerX: number,
  centerZ: number,
  count = 34
): {
  group: THREE.Group;
  hitProxy: THREE.Object3D;
  dispose: () => void;
} {
  const group = new THREE.Group();
  group.name = 'CigaretteButtsCluster';

  const filterGeo = new THREE.CylinderGeometry(0.0048, 0.0048, 0.018, 8);
  filterGeo.rotateZ(Math.PI / 2);
  const paperGeo = new THREE.CylinderGeometry(0.0046, 0.0046, 0.022, 8);
  paperGeo.rotateZ(Math.PI / 2);
  const ashGeo = new THREE.ConeGeometry(0.0046, 0.009, 7);
  ashGeo.rotateZ(-Math.PI / 2);
  const smudgeGeo = new THREE.CircleGeometry(0.024, 10);
  smudgeGeo.rotateX(-Math.PI / 2);

  const filterMat = new THREE.MeshStandardMaterial({ color: 0xc27c42, roughness: 0.85 });
  const paperMat = new THREE.MeshStandardMaterial({ color: 0xd9d3c7, roughness: 0.9 });
  const ashMat = new THREE.MeshStandardMaterial({ color: 0x3b3a38, roughness: 0.98 });
  const smudgeMat = new THREE.MeshBasicMaterial({
    color: 0x161412,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });

  const filters = new THREE.InstancedMesh(filterGeo, filterMat, count);
  const papers = new THREE.InstancedMesh(paperGeo, paperMat, count);
  const ashes = new THREE.InstancedMesh(ashGeo, ashMat, count);
  const smudges = new THREE.InstancedMesh(smudgeGeo, smudgeMat, count);

  filters.castShadow = true;
  papers.castShadow = true;

  const dummy = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    const seed1 = Math.sin(i * 12.9898) * 43758.5453;
    const rand1 = seed1 - Math.floor(seed1);
    const seed2 = Math.sin(i * 78.233) * 19341.123;
    const rand2 = seed2 - Math.floor(seed2);
    const seed3 = Math.sin(i * 39.425) * 81234.567;
    const rand3 = seed3 - Math.floor(seed3);

    const angle = (i / count) * Math.PI * 2 + (rand1 - 0.5) * 0.45;
    const radius = 0.29 + rand2 * 0.48;
    const bx = centerX + Math.cos(angle) * radius;
    const bz = centerZ + Math.sin(angle) * radius;
    const yaw = rand3 * Math.PI * 2;
    const lenScale = 0.78 + rand1 * 0.45;

    dummy.position.set(bx, 0.005, bz);
    dummy.rotation.set(0, yaw, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    filters.setMatrixAt(i, dummy.matrix);

    const cos = Math.cos(yaw);
    const sin = Math.sin(yaw);
    dummy.position.set(bx + cos * (0.018 * lenScale), 0.0048, bz - sin * (0.018 * lenScale));
    dummy.scale.set(lenScale, 1, 1);
    dummy.updateMatrix();
    papers.setMatrixAt(i, dummy.matrix);

    dummy.position.set(bx + cos * (0.032 * lenScale), 0.0048, bz - sin * (0.032 * lenScale));
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    ashes.setMatrixAt(i, dummy.matrix);

    dummy.position.set(bx + cos * (0.036 * lenScale), 0.002, bz - sin * (0.036 * lenScale));
    dummy.rotation.set(0, yaw, 0);
    dummy.scale.set(0.8 + rand2 * 0.7, 1, 0.8 + rand1 * 0.7);
    dummy.updateMatrix();
    smudges.setMatrixAt(i, dummy.matrix);
  }

  filters.instanceMatrix.needsUpdate = true;
  papers.instanceMatrix.needsUpdate = true;
  ashes.instanceMatrix.needsUpdate = true;
  smudges.instanceMatrix.needsUpdate = true;
  filters.computeBoundingSphere();
  papers.computeBoundingSphere();
  ashes.computeBoundingSphere();
  smudges.computeBoundingSphere();

  group.add(smudges, filters, papers, ashes);

  const ashtrayGroup = new THREE.Group();
  ashtrayGroup.position.set(centerX + 0.36, 0, centerZ + 0.24);
  const dish = new THREE.Mesh(
    new THREE.CylinderGeometry(0.068, 0.056, 0.028, 16),
    new THREE.MeshStandardMaterial({ color: 0x4b5058, roughness: 0.42, metalness: 0.72 })
  );
  dish.position.y = 0.014;
  dish.castShadow = true;
  ashtrayGroup.add(dish);

  const ashPile = new THREE.Mesh(
    new THREE.CylinderGeometry(0.052, 0.052, 0.01, 12),
    ashMat
  );
  ashPile.position.y = 0.025;
  ashtrayGroup.add(ashPile);
  group.add(ashtrayGroup);

  const hitProxy = new THREE.Mesh(
    new THREE.CylinderGeometry(0.68, 0.68, 0.14, 14),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hitProxy.position.set(centerX, 0.07, centerZ);
  hitProxy.userData.objectId = 'colillas';
  group.add(hitProxy);

  group.traverse((c) => {
    c.userData.objectId = 'colillas';
  });

  return {
    group,
    hitProxy,
    dispose: () => {
      filterGeo.dispose();
      paperGeo.dispose();
      ashGeo.dispose();
      smudgeGeo.dispose();
      dish.geometry.dispose();
      ashPile.geometry.dispose();
      hitProxy.geometry.dispose();
      filterMat.dispose();
      paperMat.dispose();
      ashMat.dispose();
      smudgeMat.dispose();
      (dish.material as THREE.Material).dispose();
      (hitProxy.material as THREE.Material).dispose();
    },
  };
}
