import * as THREE from 'three';
import {
  createContactShadowTexture,
  createDenimTexture,
  createDirtySneakerTexture,
  createSadFaceTexture,
  createWornTeeTexture,
} from './proceduralTextures';

export interface SadManRig {
  group: THREE.Group;
  hitProxies: THREE.Object3D[];
  update: (elapsed: number) => void;
  dispose: () => void;
}

function tagObjectId(obj: THREE.Object3D, objectId: string) {
  obj.traverse((child) => {
    child.userData.objectId = objectId;
  });
}

export function buildSadMan(anisotropy: number): SadManRig {
  const root = new THREE.Group();
  root.name = 'SadManRoot';

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

  // Textures
  const faceTex = createSadFaceTexture(anisotropy);
  const denimShirtTex = createDenimTexture(anisotropy, false);
  const jeansTex = createDenimTexture(anisotropy, true);
  const teeTex = createWornTeeTexture(anisotropy);
  const sneakerTex = createDirtySneakerTexture(anisotropy);
  const shadowTex = createContactShadowTexture();
  textures.push(faceTex, denimShirtTex, jeansTex, teeTex, sneakerTex, shadowTex);

  // Materials (varied roughness >= 0.25 across materials)
  const skinMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xb68a70,
      roughness: 0.72,
      metalness: 0.02,
    })
  );
  const faceMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: faceTex,
      roughness: 0.68,
      metalness: 0.02,
    })
  );
  const hairMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x261d18,
      roughness: 0.94,
      metalness: 0.0,
    })
  );
  const denimShirtMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: denimShirtTex,
      roughness: 0.86,
      metalness: 0.03,
    })
  );
  const teeMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: teeTex,
      roughness: 0.92,
      metalness: 0.0,
    })
  );
  const jeansMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: jeansTex,
      roughness: 0.88,
      metalness: 0.02,
    })
  );
  const sneakerMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: sneakerTex,
      roughness: 0.84,
      metalness: 0.02,
    })
  );
  const rubberSoleMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x8f887d,
      roughness: 0.78,
      metalness: 0.04,
    })
  );
  const laceMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xbdb6aa,
      roughness: 0.9,
      metalness: 0.0,
    })
  );
  const beltMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x3b2a20,
      roughness: 0.65,
      metalness: 0.08,
    })
  );
  const brassMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x9b8252,
      roughness: 0.38,
      metalness: 0.78,
    })
  );
  const eyeCorneaMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x1d1613,
      roughness: 0.14,
      metalness: 0.1,
    })
  );

  // Contact shadow grounding plane
  const contactShadow = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(1.15, 0.95)),
    trackMat(
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        opacity: 0.62,
        depthWrite: false,
      })
    )
  );
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.004;
  root.add(contactShadow);

  // =========================================================
  // 1. FEET & DIRTY UNTIE SNEAKERS (y = 0 grounded)
  // =========================================================
  const shoesGroup = new THREE.Group();
  const buildSneaker = (side: -1 | 1) => {
    const shoe = new THREE.Group();
    shoe.position.set(side * 0.125, 0, 0.03);
    shoe.rotation.y = side * 0.11;

    // Outsole (sits flush on y=0)
    const sole = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.105, 0.028, 0.255)),
      rubberSoleMat
    );
    sole.position.set(0, 0.014, 0.03);
    sole.castShadow = true;
    sole.receiveShadow = true;
    shoe.add(sole);

    // Toe cap rubber
    const toeCap = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.05, 0.052, 0.036, 16)),
      rubberSoleMat
    );
    toeCap.position.set(0, 0.025, 0.128);
    toeCap.scale.set(1.0, 0.85, 0.9);
    shoe.add(toeCap);

    // Canvas upper
    const upper = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.096, 0.068, 0.215)),
      sneakerMat
    );
    upper.position.set(0, 0.056, 0.022);
    upper.castShadow = true;
    shoe.add(upper);

    // Rounded instep / tongue
    const tongue = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.072, 0.055, 0.08)),
      sneakerMat
    );
    tongue.position.set(0, 0.088, 0.04);
    tongue.rotation.x = -0.45;
    shoe.add(tongue);

    // Untied shoelaces drooping onto the floor!
    const buildLooseLace = (xOffset: number, zDir: number) => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(xOffset * 0.35, 0.088, 0.065),
        new THREE.Vector3(xOffset * 1.15, 0.058, 0.07 + zDir * 0.02),
        new THREE.Vector3(xOffset * 1.65, 0.018, 0.065 + zDir * 0.05),
        new THREE.Vector3(xOffset * 2.1, 0.009, 0.09 + zDir * 0.07),
      ]);
      const lace = new THREE.Mesh(
        trackGeo(new THREE.TubeGeometry(curve, 14, 0.005, 6, false)),
        laceMat
      );
      lace.castShadow = true;
      return lace;
    };

    shoe.add(buildLooseLace(-0.045, 0.4));
    shoe.add(buildLooseLace(0.048, -0.25));

    // Cross lace bars across open tongue
    for (let i = 0; i < 3; i++) {
      const bar = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.004, 0.004, 0.068, 6)),
        laceMat
      );
      bar.rotation.z = Math.PI / 2;
      bar.position.set(0, 0.076 + i * 0.008, 0.075 - i * 0.018);
      shoe.add(bar);
    }

    return shoe;
  };

  shoesGroup.add(buildSneaker(-1));
  shoesGroup.add(buildSneaker(1));
  tagObjectId(shoesGroup, 'zapatos');
  root.add(shoesGroup);

  // =========================================================
  // 2. RIPPED JEANS LEGS & PELVIS
  // =========================================================
  const bodyGroup = new THREE.Group();
  const buildLeg = (side: -1 | 1, hasKneeRip: boolean) => {
    const leg = new THREE.Group();
    leg.position.set(side * 0.115, 0.085, 0.01);

    // Calf
    const calf = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.072, 0.058, 0.41, 14)),
      jeansMat
    );
    calf.position.set(side * 0.008, 0.205, -0.01);
    calf.rotation.z = side * -0.02;
    calf.castShadow = true;
    calf.receiveShadow = true;
    leg.add(calf);

    // Bunched ankle cuff
    const cuff = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(0.058, 0.014, 8, 14)),
      jeansMat
    );
    cuff.rotation.x = Math.PI / 2;
    cuff.position.set(side * 0.01, 0.02, -0.005);
    leg.add(cuff);

    // Thigh
    const thigh = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.094, 0.075, 0.42, 14)),
      jeansMat
    );
    thigh.position.set(side * 0.002, 0.61, 0.005);
    thigh.rotation.x = -0.03;
    thigh.castShadow = true;
    thigh.receiveShadow = true;
    leg.add(thigh);

    // Knee rip detail (skin peeking through + frayed threads)
    if (hasKneeRip) {
      const kneeSkin = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.068, 0.044, 0.025)),
        skinMat
      );
      kneeSkin.position.set(side * 0.004, 0.415, 0.066);
      leg.add(kneeSkin);

      // Frayed denim threads across tear
      for (let t = -2; t <= 2; t++) {
        const thread = new THREE.Mesh(
          trackGeo(new THREE.CylinderGeometry(0.0022, 0.0022, 0.07, 4)),
          laceMat
        );
        thread.rotation.z = Math.PI / 2 + (t % 2) * 0.06;
        thread.position.set(side * 0.004, 0.402 + t * 0.008, 0.078);
        leg.add(thread);
      }
    }

    return leg;
  };

  bodyGroup.add(buildLeg(-1, false));
  bodyGroup.add(buildLeg(1, true));

  // Pelvis / Hips + Belt
  const pelvis = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.175, 0.168, 0.17, 16)),
    jeansMat
  );
  pelvis.scale.set(1.06, 1, 0.72);
  pelvis.position.set(0, 0.91, 0.01);
  pelvis.castShadow = true;
  bodyGroup.add(pelvis);

  const belt = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.179, 0.179, 0.038, 18)),
    beltMat
  );
  belt.scale.set(1.07, 1, 0.74);
  belt.position.set(0, 0.975, 0.01);
  bodyGroup.add(belt);

  const buckle = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.056, 0.042, 0.018)),
    brassMat
  );
  buckle.position.set(0, 0.975, 0.138);
  bodyGroup.add(buckle);

  // =========================================================
  // 3. SLOUCHED TORSO, WORN TEE & OPEN DENIM SHIRT
  // =========================================================
  const torsoPivot = new THREE.Group();
  torsoPivot.position.set(0, 0.98, 0.01);
  // Subtle heavy slouch forward
  torsoPivot.rotation.x = 0.085;
  bodyGroup.add(torsoPivot);

  // Inner dark faded charcoal t-shirt torso
  const teeTorso = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.186, 0.165, 0.47, 18)),
    teeMat
  );
  teeTorso.scale.set(1.12, 1, 0.74);
  teeTorso.position.set(0, 0.23, 0);
  teeTorso.castShadow = true;
  teeTorso.receiveShadow = true;
  torsoPivot.add(teeTorso);

  // Denim shirt back & sides wrap (leaving front center open to show dark tee)
  const shirtBack = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.198, 0.182, 0.49, 18, 1, false, Math.PI * 0.26, Math.PI * 1.48)),
    denimShirtMat
  );
  shirtBack.scale.set(1.14, 1, 0.78);
  shirtBack.position.set(0, 0.225, -0.006);
  shirtBack.rotation.y = Math.PI;
  shirtBack.castShadow = true;
  shirtBack.receiveShadow = true;
  torsoPivot.add(shirtBack);

  // Left & Right open front denim shirt panels
  const buildShirtPanel = (side: -1 | 1) => {
    const panelGroup = new THREE.Group();
    const panel = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.115, 0.48, 0.025)),
      denimShirtMat
    );
    panel.position.set(side * 0.108, 0.215, 0.124);
    panel.rotation.y = side * -0.26;
    panel.castShadow = true;
    panelGroup.add(panel);

    // Chest flap pocket
    const pocket = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.068, 0.075, 0.012)),
      denimShirtMat
    );
    pocket.position.set(side * 0.112, 0.31, 0.136);
    pocket.rotation.y = side * -0.26;
    panelGroup.add(pocket);

    // Small brass buttons down placket
    for (let b = 0; b < 4; b++) {
      const btn = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.006, 0.006, 0.006, 8)),
        brassMat
      );
      btn.rotation.x = Math.PI / 2;
      btn.position.set(side * 0.062, 0.37 - b * 0.085, 0.141);
      panelGroup.add(btn);
    }

    return panelGroup;
  };
  torsoPivot.add(buildShirtPanel(-1));
  torsoPivot.add(buildShirtPanel(1));

  // Denim shirt collar
  const collar = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(0.088, 0.02, 8, 16, Math.PI * 1.45)),
    denimShirtMat
  );
  collar.rotation.x = Math.PI / 2 + 0.18;
  collar.rotation.z = Math.PI * 0.78;
  collar.position.set(0, 0.47, 0.008);
  torsoPivot.add(collar);

  // =========================================================
  // 4. DROOPED SHOULDERS, ROLLED-UP SLEEVES & ARMS
  // =========================================================
  const buildArm = (side: -1 | 1) => {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.228, 0.425, -0.01);
    // Dropped, heavy posture
    shoulder.rotation.z = side * 0.09;
    shoulder.rotation.x = 0.09;

    // Shoulder cap
    const shoulderBall = new THREE.Mesh(
      trackGeo(new THREE.SphereGeometry(0.062, 12, 12)),
      denimShirtMat
    );
    shoulderBall.castShadow = true;
    shoulder.add(shoulderBall);

    // Upper sleeve (denim)
    const upperSleeve = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.056, 0.048, 0.26, 12)),
      denimShirtMat
    );
    upperSleeve.position.set(side * 0.012, -0.13, 0);
    upperSleeve.castShadow = true;
    shoulder.add(upperSleeve);

    // Rolled-up cuff ring at mid-forearm
    const cuffRoll = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(0.047, 0.013, 8, 14)),
      denimShirtMat
    );
    cuffRoll.rotation.x = Math.PI / 2;
    cuffRoll.position.set(side * 0.016, -0.255, 0.015);
    shoulder.add(cuffRoll);

    // Bare weary forearm bent slightly forward
    const elbowGroup = new THREE.Group();
    elbowGroup.position.set(side * 0.016, -0.26, 0.01);
    elbowGroup.rotation.x = -0.22;
    shoulder.add(elbowGroup);

    const forearm = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.042, 0.032, 0.24, 12)),
      skinMat
    );
    forearm.position.set(0, -0.12, 0);
    forearm.castShadow = true;
    elbowGroup.add(forearm);

    // Hand
    const palm = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.038, 0.075, 0.06)),
      skinMat
    );
    palm.position.set(side * -0.005, -0.26, 0.01);
    palm.castShadow = true;
    elbowGroup.add(palm);

    // Fingers slightly curled downward
    const fingers = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.032, 0.048, 0.048)),
      skinMat
    );
    fingers.position.set(side * -0.008, -0.31, 0.014);
    fingers.rotation.z = side * -0.15;
    elbowGroup.add(fingers);

    return shoulder;
  };

  const leftArm = buildArm(-1);
  const rightArm = buildArm(1);
  torsoPivot.add(leftArm);
  torsoPivot.add(rightArm);

  // =========================================================
  // 5. BOWED NECK, SAD FACE (OJERAS), UNKEMPT BEARD & MESSY HAIR
  // =========================================================
  const headPivot = new THREE.Group();
  headPivot.position.set(0, 0.485, 0.018);
  // Head bowed down slightly in quiet exhaustion
  headPivot.rotation.x = 0.16;
  torsoPivot.add(headPivot);

  const neck = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.056, 0.065, 0.095, 12)),
    skinMat
  );
  neck.position.set(0, 0.03, -0.005);
  neck.castShadow = true;
  headPivot.add(neck);

  // Sculpted head sphere with face texture mapped cleanly to +Z
  const headMesh = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(0.114, 24, 24)),
    faceMat
  );
  headMesh.scale.set(0.92, 1.12, 0.98);
  headMesh.position.set(0, 0.165, 0.012);
  // Rotate so the painted face (u=0.5) faces +Z
  headMesh.rotation.y = -Math.PI / 2;
  headMesh.castShadow = true;
  headPivot.add(headMesh);

  // Ears
  for (const side of [-1, 1] as const) {
    const ear = new THREE.Mesh(
      trackGeo(new THREE.SphereGeometry(0.024, 8, 8)),
      skinMat
    );
    ear.scale.set(0.45, 1.15, 0.72);
    ear.position.set(side * 0.105, 0.16, -0.002);
    headPivot.add(ear);
  }

  // Sculpted 3D nose for profile depth (matches 360 turnaround silhouette)
  const nose = new THREE.Mesh(
    trackGeo(new THREE.ConeGeometry(0.019, 0.052, 8)),
    skinMat
  );
  nose.rotation.x = Math.PI * 0.42;
  nose.position.set(0, 0.158, 0.116);
  headPivot.add(nose);

  // Subtle glossy cornea highlights inside tired eyes
  for (const side of [-1, 1] as const) {
    const eye = new THREE.Mesh(
      trackGeo(new THREE.SphereGeometry(0.009, 10, 10)),
      eyeCorneaMat
    );
    eye.position.set(side * 0.036, 0.184, 0.104);
    headPivot.add(eye);
  }

  // Unkempt full beard & drooping mustache (3D sculpted volume)
  const beardGroup = new THREE.Group();
  headPivot.add(beardGroup);

  const chinBeard = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(0.088, 14, 12)),
    hairMat
  );
  chinBeard.scale.set(0.96, 0.92, 0.88);
  chinBeard.position.set(0, 0.094, 0.034);
  chinBeard.castShadow = true;
  beardGroup.add(chinBeard);

  // Jawline beard tufts (slightly scruffy/uneven)
  const jawOffsets: Array<[number, number, number, number]> = [
    [-0.072, 0.118, 0.032, 0.034],
    [0.072, 0.118, 0.032, 0.034],
    [-0.052, 0.086, 0.068, 0.036],
    [0.052, 0.086, 0.068, 0.036],
    [0, 0.064, 0.068, 0.038],
    [-0.025, 0.072, 0.082, 0.026],
    [0.025, 0.072, 0.082, 0.026],
  ];
  for (const [bx, by, bz, br] of jawOffsets) {
    const tuft = new THREE.Mesh(
      trackGeo(new THREE.DodecahedronGeometry(br, 1)),
      hairMat
    );
    tuft.position.set(bx, by, bz);
    beardGroup.add(tuft);
  }

  // Drooping mustache over sad mouth corners
  for (const side of [-1, 1] as const) {
    const stache = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.011, 0.008, 0.046, 8)),
      hairMat
    );
    stache.rotation.z = side * (Math.PI / 2 - 0.34);
    stache.position.set(side * 0.022, 0.123, 0.106);
    beardGroup.add(stache);
  }

  // Messy tousled dark hair (cabello desordenado)
  const hairCap = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(0.118, 18, 16, 0, Math.PI * 2, 0, Math.PI * 0.6)),
    hairMat
  );
  hairCap.scale.set(0.96, 1.06, 1.03);
  hairCap.position.set(0, 0.184, 0.002);
  hairCap.rotation.x = -0.22;
  hairCap.castShadow = true;
  headPivot.add(hairCap);

  // 26 individual disheveled hair locks & cowlicks around crown, forehead, temples & back
  const lockSpecs: Array<[number, number, number, number, number, number, number]> = [
    // [x, y, z, rotX, rotY, rotZ, length]
    [-0.04, 0.255, 0.085, 0.95, 0.2, 0.35, 0.065],
    [0.01, 0.265, 0.095, 1.08, -0.1, -0.25, 0.072],
    [0.055, 0.248, 0.075, 0.92, -0.3, -0.45, 0.06],
    [-0.072, 0.23, 0.052, 0.65, 0.5, 0.55, 0.062],
    [0.076, 0.225, 0.052, 0.72, -0.4, -0.58, 0.058],
    [-0.03, 0.295, 0.02, -0.25, 0.2, 0.52, 0.068],
    [0.025, 0.302, 0.015, 0.22, -0.15, -0.48, 0.07],
    [0.0, 0.308, -0.02, -0.42, 0.1, 0.25, 0.074],
    [-0.065, 0.28, -0.025, -0.35, 0.3, 0.75, 0.062],
    [0.065, 0.278, -0.028, -0.28, -0.2, -0.72, 0.062],
    [-0.095, 0.21, -0.02, -0.1, 0.4, 0.95, 0.058],
    [0.095, 0.208, -0.018, 0.1, -0.4, -0.92, 0.056],
    [-0.088, 0.185, -0.065, -0.6, 0.3, 0.65, 0.055],
    [0.088, 0.182, -0.065, -0.55, -0.3, -0.62, 0.055],
    [-0.042, 0.245, -0.092, -1.05, 0.2, 0.2, 0.066],
    [0.04, 0.242, -0.094, -1.1, -0.2, -0.22, 0.068],
    [0.0, 0.195, -0.105, -1.3, 0, 0.12, 0.06],
    [-0.05, 0.155, -0.092, -1.45, 0.2, 0.35, 0.055],
    [0.05, 0.155, -0.092, -1.42, -0.2, -0.35, 0.055],
    [-0.02, 0.282, 0.062, 0.78, 0.1, 0.18, 0.064],
  ];

  for (const [lx, ly, lz, rx, ry, rz, len] of lockSpecs) {
    const lock = new THREE.Mesh(
      trackGeo(new THREE.ConeGeometry(0.017, len, 6)),
      hairMat
    );
    lock.position.set(lx, ly, lz);
    lock.rotation.set(rx, ry, rz);
    lock.castShadow = true;
    headPivot.add(lock);
  }

  tagObjectId(bodyGroup, 'hombre');
  root.add(bodyGroup);

  // Invisible simplified raycast hit proxy for easy tapping on mobile/elder-friendly
  const hitProxy = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.32, 0.3, 1.5, 10)),
    trackMat(new THREE.MeshBasicMaterial({ visible: false }))
  );
  hitProxy.position.set(0, 0.96, 0.02);
  hitProxy.userData.objectId = 'hombre';
  root.add(hitProxy);

  const shoeHitProxy = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.55, 0.2, 0.45)),
    trackMat(new THREE.MeshBasicMaterial({ visible: false }))
  );
  shoeHitProxy.position.set(0, 0.1, 0.05);
  shoeHitProxy.userData.objectId = 'zapatos';
  root.add(shoeHitProxy);

  return {
    group: root,
    hitProxies: [hitProxy, shoeHitProxy],
    update: (elapsed: number) => {
      // Slow, heavy breathing chest & subtle downcast head weight
      const breath = Math.sin(elapsed * 1.15);
      torsoPivot.rotation.x = 0.085 + breath * 0.012;
      torsoPivot.position.y = 0.98 + breath * 0.004;
      headPivot.rotation.x = 0.16 - breath * 0.01;
      leftArm.rotation.z = -0.09 - breath * 0.008;
      rightArm.rotation.z = 0.09 + breath * 0.008;
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
  // Deterministic seeded placement around his shoes (avoiding overlapping inside shoe soles)
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

    // Filter
    dummy.position.set(bx, 0.005, bz);
    dummy.rotation.set(0, yaw, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    filters.setMatrixAt(i, dummy.matrix);

    // Paper shaft offset along local +X
    const cos = Math.cos(yaw);
    const sin = Math.sin(yaw);
    dummy.position.set(bx + cos * (0.018 * lenScale), 0.0048, bz - sin * (0.018 * lenScale));
    dummy.scale.set(lenScale, 1, 1);
    dummy.updateMatrix();
    papers.setMatrixAt(i, dummy.matrix);

    // Ash tip
    dummy.position.set(bx + cos * (0.032 * lenScale), 0.0048, bz - sin * (0.032 * lenScale));
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    ashes.setMatrixAt(i, dummy.matrix);

    // Faint floor ash smudge
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

  // Overflowing metal ashtray on the floor slightly to his right-front
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
