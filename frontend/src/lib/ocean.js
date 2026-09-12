import * as THREE from "three";

const waterVert = /* glsl */ `
  uniform float uTime;
  varying vec3 vW;
  varying vec3 vN;
  void main() {
    vec3 p = position;
    float w1 = sin(p.x * 0.22 + uTime * 0.7) * 0.22;
    float w2 = sin(p.z * 0.18 + uTime * 0.95) * 0.16;
    p.y += w1 + w2;
    vec3 n = normalize(normal + vec3(-w1 * 0.4, 1.0, -w2 * 0.4));
    vec4 wp = modelMatrix * vec4(p, 1.0);
    vW = wp.xyz;
    vN = normalize(mat3(modelMatrix) * n);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const waterFrag = /* glsl */ `
  uniform float uTime;
  varying vec3 vW;
  varying vec3 vN;
  void main() {
    vec3 V = normalize(cameraPosition - vW);
    float fres = pow(1.0 - max(dot(normalize(vN), V), 0.0), 3.0);
    vec3 deep = vec3(0.02, 0.28, 0.48);
    vec3 sky = vec3(0.55, 0.86, 1.0);
    vec3 col = mix(deep, sky, fres);
    float spark = pow(max(sin(vW.x * 1.8 + uTime) * sin(vW.z * 1.4 - uTime * 1.2), 0.0), 12.0);
    col += spark * 0.35;
    gl_FragColor = vec4(col, 0.72);
  }
`;

const sandVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const sandFrag = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    vec2 uv = vUv * 8.0;
    float n = sin(uv.x * 3.1) * sin(uv.y * 2.7) * 0.08;
    vec3 sand = vec3(0.76, 0.62, 0.42) + n;
    float a = sin(uv.x * 6.0 + uTime * 1.4);
    float b = sin(uv.y * 5.2 - uTime * 1.1);
    float c = sin((uv.x + uv.y) * 4.4 + uTime * 0.8);
    float caustic = pow(0.5 + 0.5 * a * b * c, 3.2);
    sand += vec3(0.25, 0.72, 0.95) * caustic * 0.55;
    sand += vec3(0.05, 0.18, 0.28) * (1.0 - vUv.y);
    gl_FragColor = vec4(sand, 1.0);
  }
`;

function skin(color, belly = 0xf2e6c9) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.28,
    metalness: 0.08,
    clearcoat: 0.9,
    clearcoatRoughness: 0.22,
    sheen: 0.55,
    sheenRoughness: 0.4,
    sheenColor: new THREE.Color(belly),
  });
}

function makeFish({ color, belly, scale = 1, speed = 1 }) {
  const g = new THREE.Group();
  const mat = skin(color, belly);
  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 18), mat);
  body.scale.set(1.2, 0.5, 0.36);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.36, 20, 14), mat);
  head.position.set(0.78, 0.03, 0);
  head.scale.set(1.05, 0.92, 0.88);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.72, 4), mat);
  tail.rotation.z = Math.PI / 2;
  tail.position.set(-1.12, 0, 0);
  tail.scale.set(0.28, 1, 1.15);
  const dorsal = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.42, 3), mat);
  dorsal.position.set(0.05, 0.46, 0);
  const side = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.32, 3), mat);
  side.rotation.x = 0.9;
  side.position.set(0.15, -0.12, 0.28);
  const side2 = side.clone();
  side2.rotation.x = -0.9;
  side2.position.z *= -1;
  const eyeMat = new THREE.MeshPhysicalMaterial({ color: 0x0c121c, roughness: 0.15, metalness: 0.4 });
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), eyeMat);
  eye.position.set(0.95, 0.12, 0.2);
  const eye2 = eye.clone();
  eye2.position.z *= -1;
  const glint = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  glint.position.set(1.0, 0.15, 0.24);
  const glint2 = glint.clone();
  glint2.position.z *= -1;
  g.add(body, head, tail, dorsal, side, side2, eye, eye2, glint, glint2);
  g.scale.setScalar(scale);
  g.userData = { tail, dorsal, phase: Math.random() * 6, speed, radius: 4 + Math.random() * 5, y: -0.2 + Math.random() * 2.4 };
  return g;
}

function makeCoral(x, z, h, color) {
  const g = new THREE.Group();
  const mat = new THREE.MeshPhysicalMaterial({ color, roughness: 0.7, flatShading: true });
  for (let i = 0; i < 5; i++) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.14, h * (0.5 + Math.random() * 0.6), 6), mat);
    arm.position.set((Math.random() - 0.5) * 0.35, h * 0.25, (Math.random() - 0.5) * 0.35);
    arm.rotation.z = (Math.random() - 0.5) * 0.5;
    arm.rotation.x = (Math.random() - 0.5) * 0.5;
    g.add(arm);
  }
  g.position.set(x, -3.55, z);
  return g;
}

function makeKelp(x, z) {
  const mat = new THREE.MeshPhysicalMaterial({ color: 0x1f6b46, roughness: 0.55, sheen: 0.3, sheenColor: 0x7dffa3 });
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.09, 3.4, 6, 8), mat);
  mesh.position.set(x, -1.9, z);
  mesh.userData.phase = Math.random() * 5;
  return mesh;
}

function makeJelly(x, y, z) {
  const g = new THREE.Group();
  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 20, 14, 0, Math.PI * 2, 0, 1.35),
    new THREE.MeshPhysicalMaterial({
      color: 0xf3c4e8,
      roughness: 0.12,
      transmission: 0.65,
      thickness: 0.6,
      transparent: true,
      opacity: 0.85,
      sheen: 0.8,
      sheenColor: 0xff8ad3,
    })
  );
  g.add(cap);
  const tent = new THREE.MeshPhysicalMaterial({ color: 0xf7d6ee, transparent: true, opacity: 0.45, roughness: 0.3 });
  for (let i = 0; i < 6; i++) {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.01, 1.3, 5), tent);
    const a = (i / 6) * Math.PI * 2;
    t.position.set(Math.cos(a) * 0.18, -0.85, Math.sin(a) * 0.18);
    g.add(t);
  }
  g.position.set(x, y, z);
  g.userData.phase = Math.random() * 4;
  return g;
}

export function createOcean(canvas) {
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 90);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.setClearColor(0x146ea8);
  scene.fog = new THREE.FogExp2(0x146ea8, 0.038);

  scene.add(new THREE.HemisphereLight(0x9be7ff, 0x3a6a4a, 0.85));
  const sun = new THREE.DirectionalLight(0xfff4d2, 1.35);
  sun.position.set(8, 16, 6);
  scene.add(sun);
  const aqua = new THREE.PointLight(0x66e0ff, 18, 28);
  aqua.position.set(-4, 4, 3);
  scene.add(aqua);

  cam.position.set(0, 0.2, 11.5);
  cam.lookAt(0, 0.4, 0);

  const uTime = { value: 0 };
  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(48, 48, 64, 64),
    new THREE.ShaderMaterial({
      uniforms: { uTime },
      vertexShader: waterVert,
      fragmentShader: waterFrag,
      transparent: true,
      side: THREE.DoubleSide,
    })
  );
  water.rotation.x = -Math.PI / 2;
  water.position.y = 4.6;
  scene.add(water);

  const sand = new THREE.Mesh(
    new THREE.CircleGeometry(22, 64),
    new THREE.ShaderMaterial({ uniforms: { uTime }, vertexShader: sandVert, fragmentShader: sandFrag })
  );
  sand.rotation.x = -Math.PI / 2;
  sand.position.y = -3.7;
  scene.add(sand);

  const rocks = [ [-6, -4], [7, -5], [2, -8], [-3, -7] ];
  rocks.forEach(([x, z]) => {
    const r = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.55 + Math.random() * 0.4, 0),
      new THREE.MeshStandardMaterial({ color: 0x6d645c, roughness: 0.92, flatShading: true })
    );
    r.position.set(x, -3.35, z);
    r.rotation.set(Math.random(), Math.random(), Math.random());
    scene.add(r);
  });

  scene.add(makeCoral(-6.2, -3.2, 1.4, 0xe07040));
  scene.add(makeCoral(6.8, -2.4, 1.1, 0xf2a05a));
  scene.add(makeCoral(1.5, -6.5, 1.7, 0xd4546a));
  const kelp = [-7, -2, 5, 8].map((x, i) => {
    const k = makeKelp(x, -4 - i);
    scene.add(k);
    return k;
  });

  const fishes = [
    makeFish({ color: 0xff6a2b, belly: 0xffe08a, scale: 0.72, speed: 0.55 }),
    makeFish({ color: 0x3aa0c8, belly: 0xe8f6ff, scale: 0.9, speed: 0.38 }),
    makeFish({ color: 0xe7d9c2, belly: 0xfff8ea, scale: 1.15, speed: 0.28 }),
    makeFish({ color: 0x2f6f8a, belly: 0xb9d7e4, scale: 1.35, speed: 0.22 }),
    makeFish({ color: 0xf0c14b, belly: 0xfff3c4, scale: 0.55, speed: 0.7 }),
    makeFish({ color: 0xc75c6a, belly: 0xffd6c9, scale: 0.8, speed: 0.45 }),
  ];
  fishes.forEach((f) => scene.add(f));

  const jellies = [makeJelly(-3.2, 1.6, -2), makeJelly(4.4, 0.8, -3.5)];
  jellies.forEach((j) => scene.add(j));

  const dummy = new THREE.Object3D();
  const bubbles = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.06, 10, 10),
    new THREE.MeshPhysicalMaterial({
      color: 0xdff6ff,
      roughness: 0.05,
      transmission: 0.9,
      thickness: 0.2,
      transparent: true,
      opacity: 0.55,
    }),
    60
  );
  const bPos = Array.from({ length: 60 }, () => ({
    x: (Math.random() - 0.5) * 16,
    y: Math.random() * 8 - 3,
    z: (Math.random() - 0.5) * 12,
    s: 0.35 + Math.random() * 0.9,
  }));
  scene.add(bubbles);

  const onResize = () => {
    cam.aspect = innerWidth / innerHeight;
    cam.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  };
  addEventListener("resize", onResize);

  let raf;
  const tick = (t) => {
    const time = t * 0.001;
    uTime.value = time;
    cam.position.x = Math.sin(time * 0.12) * 0.45;
    cam.position.y = 0.15 + Math.sin(time * 0.18) * 0.12;
    cam.lookAt(0, 0.35, 0);
    aqua.intensity = 14 + Math.sin(time * 1.3) * 5;

    fishes.forEach((f) => {
      const u = f.userData;
      const a = time * u.speed + u.phase;
      const x = Math.cos(a) * u.radius;
      const z = Math.sin(a * 0.85) * (u.radius * 0.55) - 1.5;
      const y = u.y + Math.sin(a * 2.2) * 0.18;
      const dx = -Math.sin(a) * u.radius;
      const dz = Math.cos(a * 0.85) * (u.radius * 0.55);
      f.position.set(x, y, z);
      f.rotation.y = Math.atan2(dx, dz);
      f.rotation.z = Math.sin(a * 3) * 0.08;
      u.tail.rotation.y = Math.sin(time * (8 + u.speed * 4) + u.phase) * 0.45;
      u.dorsal.rotation.z = Math.sin(time * 5 + u.phase) * 0.12;
    });

    jellies.forEach((j) => {
      const p = j.userData.phase;
      j.position.y += Math.sin(time * 1.1 + p) * 0.004;
      j.scale.setScalar(0.95 + Math.sin(time * 2.2 + p) * 0.06);
    });
    kelp.forEach((k) => {
      k.rotation.z = Math.sin(time * 0.8 + k.userData.phase) * 0.18;
      k.rotation.x = Math.cos(time * 0.6 + k.userData.phase) * 0.08;
    });

    bPos.forEach((b, i) => {
      b.y += 0.018 * b.s;
      b.x += Math.sin(time + i) * 0.002;
      if (b.y > 4.4) b.y = -3.4;
      dummy.position.set(b.x, b.y, b.z);
      dummy.scale.setScalar(b.s);
      dummy.updateMatrix();
      bubbles.setMatrixAt(i, dummy.matrix);
    });
    bubbles.instanceMatrix.needsUpdate = true;
    renderer.render(scene, cam);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(raf);
    removeEventListener("resize", onResize);
    renderer.dispose();
  };
}
