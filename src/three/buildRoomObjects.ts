import * as THREE from 'three';
import {
  createBillsTexture,
  createClockFaceTexture,
  createContactShadowTexture,
  createMirrorTexture,
  createPhoneScreenTexture,
  createPlasterWallTexture,
  createWoodFloorTexture,
} from './proceduralTextures';

export interface RoomObjectsRig {
  group: THREE.Group;
  interactables: THREE.Object3D[];
  update: (elapsed: number) => void;
  setHighlight: (objectId: string | null) => void;
  dispose: () => void;
}

export function buildRoomObjects(anisotropy: number): RoomObjectsRig {
  const root = new THREE.Group();
  root.name = 'RoomEnvironmentGroup';

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const textures: THREE.Texture[] = [];
  const interactables: THREE.Object3D[] = [];
  const markerRings = new Map<string, THREE.Mesh>();

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    materials.push(m);
    return m;
  };
  const trackTex = <T extends THREE.Texture>(t: T): T => {
    textures.push(t);
    return t;
  };

  // Textures
  const floorTex = trackTex(createWoodFloorTexture(anisotropy));
  const wallTex = trackTex(createPlasterWallTexture(anisotropy));
  const mirrorTex = trackTex(createMirrorTexture(anisotropy));
  const clockTex = trackTex(createClockFaceTexture(anisotropy));
  const phoneTex = trackTex(createPhoneScreenTexture(anisotropy));
  const billsTex = trackTex(createBillsTexture(anisotropy));
  const shadowTex = trackTex(createContactShadowTexture());

  // Shared calibrated PBR materials
  const floorMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.78,
      metalness: 0.04,
    })
  );
  const wallMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: wallTex,
      roughness: 0.92,
      metalness: 0.0,
    })
  );
  const ceilingMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x262930,
      roughness: 0.95,
      metalness: 0.0,
    })
  );
  const woodDarkMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x453123,
      roughness: 0.72,
      metalness: 0.04,
    })
  );
  const woodWarmMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x5c402c,
      roughness: 0.68,
      metalness: 0.04,
    })
  );
  const metalMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x626a73,
      roughness: 0.42,
      metalness: 0.78,
    })
  );
  const redToolboxMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x7b3329,
      roughness: 0.52,
      metalness: 0.45,
    })
  );
  const brassMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xb29152,
      roughness: 0.35,
      metalness: 0.85,
    })
  );
  const fabricDarkMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x2c323b,
      roughness: 0.9,
      metalness: 0.02,
    })
  );

  // =========================================================
  // ROOM SHELL (4.8m x 2.75m x 4.8m — NO CROSSES ANYWHERE)
  // =========================================================
  const W = 4.8;
  const D = 4.8;
  const H = 2.75;

  const floor = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(W, D)), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  root.add(floor);

  const ceiling = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(W, D)), ceilingMat);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = H;
  root.add(ceiling);

  const makeWall = (w: number, h: number, x: number, y: number, z: number, ry: number) => {
    const wall = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(w, h)), wallMat);
    wall.position.set(x, y, z);
    wall.rotation.y = ry;
    wall.receiveShadow = true;
    root.add(wall);
  };
  makeWall(W, H, 0, H / 2, -D / 2, 0); // Back (-Z)
  makeWall(W, H, 0, H / 2, D / 2, Math.PI); // Front (+Z)
  makeWall(D, H, -W / 2, H / 2, 0, Math.PI / 2); // Left (-X)
  makeWall(D, H, W / 2, H / 2, 0, -Math.PI / 2); // Right (+X)

  // Baseboards
  const makeBaseboard = (len: number, x: number, z: number, ry: number) => {
    const b = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(len, 0.11, 0.025)), woodDarkMat);
    b.position.set(x, 0.055, z);
    b.rotation.y = ry;
    root.add(b);
  };
  makeBaseboard(W, 0, -D / 2 + 0.012, 0);
  makeBaseboard(W, 0, D / 2 - 0.012, 0);
  makeBaseboard(D, -W / 2 + 0.012, 0, Math.PI / 2);
  makeBaseboard(D, W / 2 - 0.012, 0, Math.PI / 2);

  // Back wall window with Venetian blinds (cool twilight outside, melancholic)
  const windowGroup = new THREE.Group();
  windowGroup.position.set(-0.55, 1.55, -D / 2 + 0.02);
  const windowPane = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(1.18, 1.1)),
    trackMat(
      new THREE.MeshBasicMaterial({
        color: 0x3b4d66,
      })
    )
  );
  windowGroup.add(windowPane);

  const frameTop = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.26, 0.06, 0.05)), woodDarkMat);
  frameTop.position.y = 0.56;
  const frameBot = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.28, 0.07, 0.09)), woodDarkMat);
  frameBot.position.y = -0.56;
  const frameL = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.06, 1.16, 0.05)), woodDarkMat);
  frameL.position.x = -0.6;
  const frameR = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.06, 1.16, 0.05)), woodDarkMat);
  frameR.position.x = 0.6;
  windowGroup.add(frameTop, frameBot, frameL, frameR);

  // Horizontal blinds slats (clean horizontal slats — NEVER cross-shaped!)
  const slatMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x4b535e, roughness: 0.7 }));
  for (let i = 0; i < 11; i++) {
    const slat = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.14, 0.025, 0.015)), slatMat);
    slat.position.set(0, -0.45 + i * 0.09, 0.02);
    slat.rotation.x = 0.35;
    windowGroup.add(slat);
  }
  root.add(windowGroup);

  // Warm steady floor lamp beside the table (NO flickering!)
  const lampGroup = new THREE.Group();
  lampGroup.position.set(1.95, 0, -1.75);
  const lampBase = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.18, 0.2, 0.03, 18)), metalMat);
  lampBase.position.y = 0.015;
  const lampPole = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.016, 0.02, 1.55, 10)), metalMat);
  lampPole.position.y = 0.79;
  const lampShade = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.14, 0.23, 0.28, 20, 1, true)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xc9a374,
        emissive: 0xd99b58,
        emissiveIntensity: 0.45,
        roughness: 0.85,
        side: THREE.DoubleSide,
      })
    )
  );
  lampShade.position.y = 1.56;
  lampGroup.add(lampBase, lampPole, lampShade);
  root.add(lampGroup);

  // Helper to register interactive objects with subtle floor/surface marker ring
  const registerInteractable = (
    obj: THREE.Group,
    objectId: string,
    hitSize: [number, number, number],
    hitOffset: [number, number, number] = [0, 0, 0],
    markerPos?: [number, number, number]
  ) => {
    obj.traverse((child) => {
      child.userData.objectId = objectId;
    });

    const hitBox = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(hitSize[0], hitSize[1], hitSize[2])),
      trackMat(new THREE.MeshBasicMaterial({ visible: false }))
    );
    hitBox.position.set(hitOffset[0], hitOffset[1], hitOffset[2]);
    hitBox.userData.objectId = objectId;
    obj.add(hitBox);
    interactables.push(hitBox);

    if (markerPos) {
      const ring = new THREE.Mesh(
        trackGeo(new THREE.RingGeometry(0.055, 0.075, 20)),
        trackMat(
          new THREE.MeshBasicMaterial({
            color: 0xd99b58,
            transparent: true,
            opacity: 0.42,
            side: THREE.DoubleSide,
            depthWrite: false,
          })
        )
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(markerPos[0], markerPos[1], markerPos[2]);
      obj.add(ring);
      markerRings.set(objectId, ring);
    }
    root.add(obj);
  };

  const addGroundShadow = (parent: THREE.Object3D, w: number, d: number, x = 0, z = 0) => {
    const s = new THREE.Mesh(
      trackGeo(new THREE.PlaneGeometry(w, d)),
      trackMat(
        new THREE.MeshBasicMaterial({
          map: shadowTex,
          transparent: true,
          opacity: 0.48,
          depthWrite: false,
        })
      )
    );
    s.rotation.x = -Math.PI / 2;
    s.position.set(x, 0.005, z);
    parent.add(s);
  };

  // =========================================================
  // 4. SILLA VACÍA Y CHAQUETA CAÍDA (-1.55, 0, -0.95)
  // =========================================================
  const chairGroup = new THREE.Group();
  chairGroup.position.set(-1.55, 0, -0.95);
  chairGroup.rotation.y = 0.55;
  addGroundShadow(chairGroup, 0.75, 0.75);

  const seat = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.46, 0.04, 0.44)), woodWarmMat);
  seat.position.y = 0.45;
  seat.castShadow = true;
  chairGroup.add(seat);

  for (const [lx, lz] of [
    [-0.19, -0.18],
    [0.19, -0.18],
    [-0.19, 0.18],
    [0.19, 0.18],
  ]) {
    const leg = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.02, 0.016, 0.45, 8)), woodDarkMat);
    leg.position.set(lx, 0.225, lz);
    leg.castShadow = true;
    chairGroup.add(leg);
  }
  const backPostL = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.036, 0.48, 0.036)), woodDarkMat);
  backPostL.position.set(-0.19, 0.69, -0.19);
  const backPostR = backPostL.clone();
  backPostR.position.x = 0.19;
  const backSlat = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.42, 0.16, 0.03)), woodWarmMat);
  backSlat.position.set(0, 0.84, -0.19);
  chairGroup.add(backPostL, backPostR, backSlat);

  // Draped jacket sliding off backrest
  const jacketBody = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.38, 0.34, 0.08)),
    fabricDarkMat
  );
  jacketBody.position.set(0.04, 0.66, -0.14);
  jacketBody.rotation.z = -0.18;
  jacketBody.castShadow = true;
  const jacketSleeve = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.045, 0.04, 0.38, 10)),
    fabricDarkMat
  );
  jacketSleeve.position.set(0.22, 0.52, -0.02);
  jacketSleeve.rotation.set(0.35, 0, 0.25);
  chairGroup.add(jacketBody, jacketSleeve);

  registerInteractable(chairGroup, 'silla', [0.65, 1.0, 0.65], [0, 0.5, 0], [0, 0.012, 0.38]);

  // =========================================================
  // WOODEN DESK / TABLE (Right side: 1.65, 0, -0.65)
  // =========================================================
  const tableGroup = new THREE.Group();
  tableGroup.position.set(1.65, 0, -0.65);
  addGroundShadow(tableGroup, 1.05, 1.55);

  const tableTop = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.76, 0.05, 1.38)), woodWarmMat);
  tableTop.position.y = 0.74;
  tableTop.castShadow = true;
  tableTop.receiveShadow = true;
  tableGroup.add(tableTop);

  for (const [tx, tz] of [
    [-0.32, -0.62],
    [0.32, -0.62],
    [-0.32, 0.62],
    [0.32, 0.62],
  ]) {
    const tLeg = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.055, 0.72, 0.055)), woodDarkMat);
    tLeg.position.set(tx, 0.36, tz);
    tLeg.castShadow = true;
    tableGroup.add(tLeg);
  }
  root.add(tableGroup);

  // =========================================================
  // 5. RECIBOS VENCIDOS Y CUADERNO CERRADO (on table)
  // =========================================================
  const billsGroup = new THREE.Group();
  billsGroup.position.set(1.62, 0.765, -0.65);

  const billsMat = trackMat(new THREE.MeshStandardMaterial({ map: billsTex, roughness: 0.85 }));
  for (let i = 0; i < 3; i++) {
    const sheet = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.21, 0.004, 0.27)), billsMat);
    sheet.position.set((i - 1) * 0.03, i * 0.0045, (i - 1) * 0.02);
    sheet.rotation.y = (i - 1) * 0.22;
    sheet.castShadow = true;
    billsGroup.add(sheet);
  }

  // Closed ledger notebook + pen
  const notebook = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.19, 0.024, 0.25)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x2f2924, roughness: 0.8 }))
  );
  notebook.position.set(-0.14, 0.012, 0.18);
  notebook.rotation.y = 0.14;
  notebook.castShadow = true;
  const pen = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.006, 0.006, 0.14, 8)),
    metalMat
  );
  pen.rotation.set(0, 0.45, Math.PI / 2);
  pen.position.set(-0.08, 0.03, 0.18);
  billsGroup.add(notebook, pen);

  registerInteractable(billsGroup, 'mesa_recibos', [0.46, 0.15, 0.55], [-0.04, 0.06, 0.06], [0, 0.015, 0]);

  // =========================================================
  // 8. CELULAR CON PANTALLA ENCENDIDA (on table front)
  // =========================================================
  const phoneGroup = new THREE.Group();
  phoneGroup.position.set(1.52, 0.765, -0.18);
  phoneGroup.rotation.y = -0.32;

  const phoneBody = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.082, 0.01, 0.16)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x1a1d22, roughness: 0.3, metalness: 0.7 }))
  );
  phoneBody.position.y = 0.005;
  const phoneScreen = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(0.072, 0.145)),
    trackMat(
      new THREE.MeshStandardMaterial({
        map: phoneTex,
        emissiveMap: phoneTex,
        emissive: 0xffffff,
        emissiveIntensity: 0.55,
        roughness: 0.18,
      })
    )
  );
  phoneScreen.rotation.x = -Math.PI / 2;
  phoneScreen.position.y = 0.011;
  phoneGroup.add(phoneBody, phoneScreen);

  registerInteractable(phoneGroup, 'celular', [0.22, 0.1, 0.25], [0, 0.04, 0], [0, 0.014, 0]);

  // =========================================================
  // 9. TAZA DE CAFÉ FRÍO (on table back)
  // =========================================================
  const coffeeGroup = new THREE.Group();
  coffeeGroup.position.set(1.68, 0.765, -1.04);

  const mugMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x9ea5ad, roughness: 0.32, metalness: 0.08 }));
  const mug = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.046, 0.042, 0.1, 16)), mugMat);
  mug.position.y = 0.05;
  mug.castShadow = true;
  const handle = new THREE.Mesh(trackGeo(new THREE.TorusGeometry(0.028, 0.007, 8, 12, Math.PI)), mugMat);
  handle.rotation.z = -Math.PI / 2;
  handle.position.set(0.045, 0.05, 0);
  const liquid = new THREE.Mesh(
    trackGeo(new THREE.CircleGeometry(0.041, 14)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x261810, roughness: 0.15 }))
  );
  liquid.rotation.x = -Math.PI / 2;
  liquid.position.y = 0.082;
  coffeeGroup.add(mug, handle, liquid);

  registerInteractable(coffeeGroup, 'cafe', [0.2, 0.16, 0.2], [0, 0.06, 0], [0, 0.014, 0]);

  // =========================================================
  // 6. CAJA DE HERRAMIENTAS OXIDADA (Right floor: 1.72, 0, 0.38)
  // =========================================================
  const toolboxGroup = new THREE.Group();
  toolboxGroup.position.set(1.72, 0, 0.38);
  toolboxGroup.rotation.y = -0.45;
  addGroundShadow(toolboxGroup, 0.65, 0.45);

  const boxBase = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.46, 0.18, 0.24)), redToolboxMat);
  boxBase.position.y = 0.09;
  boxBase.castShadow = true;
  const boxLid = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.46, 0.04, 0.24)), redToolboxMat);
  boxLid.position.set(0, 0.22, -0.14);
  boxLid.rotation.x = -1.1;
  // Wrench sticking out
  const wrench = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.24, 0.014, 0.032)), metalMat);
  wrench.position.set(0.06, 0.19, 0.02);
  wrench.rotation.set(0.15, 0.32, 0.28);
  // Screwdriver
  const driverShaft = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.005, 0.005, 0.18, 8)), metalMat);
  driverShaft.rotation.z = Math.PI / 2;
  driverShaft.position.set(-0.04, 0.012, 0.19);
  const driverHandle = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.016, 0.014, 0.09, 10)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xc58f36, roughness: 0.55 }))
  );
  driverHandle.rotation.z = Math.PI / 2;
  driverHandle.position.set(-0.15, 0.016, 0.19);
  toolboxGroup.add(boxBase, boxLid, wrench, driverShaft, driverHandle);

  registerInteractable(toolboxGroup, 'herramientas', [0.6, 0.38, 0.5], [0, 0.16, 0], [0, 0.014, 0.28]);

  // =========================================================
  // 7. BALÓN DESINFLADO Y TROFEO VIEJO (Left floor: -1.85, 0, 0.45)
  // =========================================================
  const ballGroup = new THREE.Group();
  ballGroup.position.set(-1.85, 0, 0.45);
  addGroundShadow(ballGroup, 0.55, 0.55);

  const soccerBall = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(0.12, 18, 16)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xbcb6aa, roughness: 0.85 }))
  );
  // Slightly deflated & resting flush
  soccerBall.scale.set(1.06, 0.78, 1.04);
  soccerBall.position.set(0, 0.092, 0);
  soccerBall.castShadow = true;
  ballGroup.add(soccerBall);

  // Small tarnished old trophy beside ball
  const trophyBase = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.1, 0.06, 0.1)), woodDarkMat);
  trophyBase.position.set(-0.22, 0.03, -0.14);
  const trophyCup = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.055, 0.025, 0.12, 14)),
    brassMat
  );
  trophyCup.position.set(-0.22, 0.12, -0.14);
  trophyCup.castShadow = true;
  ballGroup.add(trophyBase, trophyCup);

  registerInteractable(ballGroup, 'balon', [0.55, 0.35, 0.55], [-0.08, 0.12, -0.04], [0.22, 0.014, 0.12]);

  // =========================================================
  // 10. ESPEJO EMPAÑADO / AGRIETADO (Left wall: -2.37, 1.48, -0.35)
  // =========================================================
  const mirrorGroup = new THREE.Group();
  mirrorGroup.position.set(-W / 2 + 0.02, 1.48, -0.35);
  mirrorGroup.rotation.y = Math.PI / 2;

  const mirrorFrame = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.68, 0.96, 0.04)), woodDarkMat);
  mirrorFrame.castShadow = true;
  const mirrorGlass = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(0.58, 0.86)),
    trackMat(
      new THREE.MeshStandardMaterial({
        map: mirrorTex,
        roughness: 0.22,
        metalness: 0.65,
      })
    )
  );
  mirrorGlass.position.z = 0.022;
  mirrorGroup.add(mirrorFrame, mirrorGlass);

  registerInteractable(mirrorGroup, 'espejo', [0.75, 1.05, 0.18], [0, 0, 0.02]);

  // =========================================================
  // 12. RELOJ DE PARED CANSADO (Back wall: 0.88, 1.88, -2.36)
  // =========================================================
  const clockGroup = new THREE.Group();
  clockGroup.position.set(0.88, 1.88, -D / 2 + 0.03);

  const clockRim = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.22, 0.22, 0.045, 24)),
    woodDarkMat
  );
  clockRim.rotation.x = Math.PI / 2;
  clockRim.castShadow = true;
  const clockFace = new THREE.Mesh(
    trackGeo(new THREE.CircleGeometry(0.195, 24)),
    trackMat(new THREE.MeshStandardMaterial({ map: clockTex, roughness: 0.65 }))
  );
  clockFace.position.z = 0.024;

  const hourPivot = new THREE.Group();
  hourPivot.position.z = 0.028;
  const hourHand = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.012, 0.09, 0.005)),
    trackMat(new THREE.MeshBasicMaterial({ color: 0x1e1a16 }))
  );
  hourHand.position.y = 0.04;
  hourPivot.add(hourHand);
  hourPivot.rotation.z = -2.2;

  const minutePivot = new THREE.Group();
  minutePivot.position.z = 0.032;
  const minuteHand = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.008, 0.13, 0.005)),
    trackMat(new THREE.MeshBasicMaterial({ color: 0x1e1a16 }))
  );
  minuteHand.position.y = 0.06;
  minutePivot.add(minuteHand);

  clockGroup.add(clockRim, clockFace, hourPivot, minutePivot);
  registerInteractable(clockGroup, 'reloj', [0.5, 0.5, 0.15], [0, 0, 0.02]);

  // =========================================================
  // 13. LA PUERTA CERRADA (Front wall +Z: 0.15, 0, 2.38)
  // =========================================================
  const doorGroup = new THREE.Group();
  doorGroup.position.set(0.15, 0, D / 2 - 0.02);
  doorGroup.rotation.y = Math.PI;

  const doorSlab = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.92, 2.08, 0.05)), woodDarkMat);
  doorSlab.position.y = 1.04;
  doorSlab.receiveShadow = true;
  const doorTrim = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.04, 2.14, 0.03)), woodWarmMat);
  doorTrim.position.set(0, 1.07, -0.01);
  const doorHandle = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.032, 12, 12)), brassMat);
  doorHandle.position.set(0.36, 1.0, 0.045);
  const deadbolt = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.08, 0.035, 0.03)), brassMat);
  deadbolt.position.set(0.35, 1.15, 0.035);
  doorGroup.add(doorTrim, doorSlab, doorHandle, deadbolt);

  registerInteractable(doorGroup, 'puerta', [1.05, 2.1, 0.2], [0, 1.05, 0.05]);

  // =========================================================
  // 11. LLAVES SOBRE REPISA JUNTO A LA PUERTA (-0.95, 1.15, 2.34)
  // =========================================================
  const keysGroup = new THREE.Group();
  keysGroup.position.set(-0.95, 1.15, D / 2 - 0.09);
  keysGroup.rotation.y = Math.PI;

  const shelf = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.45, 0.03, 0.18)), woodWarmMat);
  const keyring = new THREE.Mesh(trackGeo(new THREE.TorusGeometry(0.022, 0.004, 8, 14)), metalMat);
  keyring.rotation.x = Math.PI / 2;
  keyring.position.set(0, 0.022, 0.02);
  const key1 = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.014, 0.004, 0.055)), brassMat);
  key1.position.set(0.015, 0.02, 0.05);
  key1.rotation.y = 0.25;
  const key2 = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.014, 0.004, 0.05)), metalMat);
  key2.position.set(-0.015, 0.02, 0.045);
  key2.rotation.y = -0.35;
  keysGroup.add(shelf, keyring, key1, key2);

  registerInteractable(keysGroup, 'llaves', [0.46, 0.25, 0.24], [0, 0.05, 0.02]);

  return {
    group: root,
    interactables,
    update: (elapsed: number) => {
      // Heavy slow clock hand
      minutePivot.rotation.z = -elapsed * 0.08;
      // Subtle gentle pulse on floor markers
      const pulse = 0.34 + Math.sin(elapsed * 2.1) * 0.12;
      markerRings.forEach((ring) => {
        const mat = ring.material as THREE.MeshBasicMaterial;
        if (!ring.userData.isHovered) {
          mat.opacity = pulse;
        }
      });
    },
    setHighlight: (objectId: string | null) => {
      markerRings.forEach((ring, id) => {
        const mat = ring.material as THREE.MeshBasicMaterial;
        const active = id === objectId;
        ring.userData.isHovered = active;
        mat.color.setHex(active ? 0xf3efe6 : 0xd99b58);
        mat.opacity = active ? 0.88 : 0.42;
      });
    },
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
    },
  };
}
