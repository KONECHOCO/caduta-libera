// Scena 3D di Last Tile: una sala del tempio con 10 lastre di pietra attorno all'altare.
// Ogni lastra porta una risposta; quelle sbagliate si spezzano in quattro blocchi e precipitano.

import { i18n } from './i18n.js';

const STONE = 0x8a7457;
const STONE_DARK = 0x4a3c2c;
const GOLD = 0xd9a441;
const EMBER = 0xff6a1a;
const RADIUS = 13.5;
const COUNT = 10;
const SLAB = 2.7;      // lato della lastra
const PIECE = SLAB / 2;

export class Temple3D {
  constructor(container) {
    this.container = container;
    this.tiles = [];
    this.torches = [];
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.onTileClick = null;

    this.targetCameraPos = new THREE.Vector3(0, 24, 30);
    this.targetLookAt = new THREE.Vector3(0, 0, 0);
    this.currentLookAt = new THREE.Vector3(0, 0, 0);
    this.shake = 0;

    this.explorerTarget = new THREE.Vector3(0, 1.1, 0);
    this.explorerFalling = false;
    this.selectedIndex = -1;
    this.isTense = false;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0d0906);
    this.scene.fog = new THREE.FogExp2(0x0d0906, 0.022);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 200);
    this.camera.position.set(0, 26, 32);
    this.camera.lookAt(this.currentLookAt);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    this.buildHall();
    this.buildAltar();
    this.buildExplorer();
    this.buildTiles();
    this.buildLights();
    this.buildDust();

    window.addEventListener('resize', () => this.onResize());
    this.renderer.domElement.addEventListener('click', (e) => this.onPointerClick(e));

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  // ---------- Costruzione della sala ----------
  buildHall() {
    // Pavimento di blocchi di arenaria
    const floor = new THREE.Mesh(
      new THREE.CylinderGeometry(21, 21, 0.6, 10),
      new THREE.MeshStandardMaterial({ color: 0x5c4a36, roughness: 0.95, metalness: 0.02 })
    );
    floor.position.y = -0.3;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Fughe del pavimento: anelli e raggi incisi
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x2e241a });
    [6.2, 10.4, 17.2].forEach(r => {
      const ring = new THREE.Mesh(new THREE.RingGeometry(r - 0.06, r + 0.06, 10), lineMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.01;
      this.scene.add(ring);
    });

    // Colonne con capitello e torce
    const colMat = new THREE.MeshStandardMaterial({ color: 0x7a6650, roughness: 0.9 });
    const capMat = new THREE.MeshStandardMaterial({ color: 0x9a8160, roughness: 0.8 });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const x = Math.cos(a) * 19.5;
      const z = Math.sin(a) * 19.5;
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.95, 9, 12), colMat);
      col.position.set(x, 4.5, z);
      col.castShadow = true;
      this.scene.add(col);
      const cap = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.6, 2.3), capMat);
      cap.position.set(x, 9.2, z);
      this.scene.add(cap);
      if (i % 2 === 0) this.addTorch(x * 0.93, 4.6, z * 0.93);
    }

    // Architrave circolare che chiude la sala
    const lintel = new THREE.Mesh(
      new THREE.TorusGeometry(19.5, 0.7, 6, 48),
      new THREE.MeshStandardMaterial({ color: 0x6d5a45, roughness: 0.9 })
    );
    lintel.rotation.x = Math.PI / 2;
    lintel.position.y = 9.8;
    this.scene.add(lintel);
  }

  addTorch(x, y, z) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    const holder = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.1, 0.9, 8),
      new THREE.MeshStandardMaterial({ color: 0x3b2a1a, roughness: 0.8 })
    );
    group.add(holder);
    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.24, 0.7, 10),
      new THREE.MeshBasicMaterial({ color: 0xffa23a })
    );
    flame.position.y = 0.75;
    group.add(flame);
    const light = new THREE.PointLight(EMBER, 1.6, 14);
    light.position.y = 0.9;
    group.add(light);
    this.scene.add(group);
    this.torches.push({ flame, light, seed: Math.random() * 10 });
  }

  buildAltar() {
    const mat = new THREE.MeshStandardMaterial({ color: STONE, roughness: 0.85 });
    const low = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.7, 0.5, 8), mat);
    low.position.y = 0.25;
    low.receiveShadow = true;
    this.scene.add(low);
    const high = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.9, 0.5, 8), mat);
    high.position.y = 0.75;
    high.receiveShadow = true;
    this.scene.add(high);

    // Idolo d'oro sospeso sopra l'altare
    this.idol = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.55, 0),
      new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.9, roughness: 0.25, emissive: 0x3a2400 })
    );
    this.idol.position.set(0, 4.2, 0);
    this.scene.add(this.idol);
  }

  buildExplorer() {
    const g = new THREE.Group();
    const khaki = new THREE.MeshStandardMaterial({ color: 0xb59262, roughness: 0.8 });
    const brown = new THREE.MeshStandardMaterial({ color: 0x5a3b1e, roughness: 0.7 });

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.42, 1.3, 16), khaki);
    body.position.y = 0.65;
    body.castShadow = true;
    g.add(body);

    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.7, 0.3), brown);
    pack.position.set(0, 0.85, -0.38);
    g.add(pack);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 20, 20),
      new THREE.MeshStandardMaterial({ color: 0xe0b48c, roughness: 0.6 })
    );
    head.position.y = 1.55;
    head.castShadow = true;
    g.add(head);

    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.05, 20), brown);
    brim.position.y = 1.74;
    g.add(brim);
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.3, 20), brown);
    crown.position.y = 1.9;
    g.add(crown);

    // Piccola lanterna in mano
    const lantern = new THREE.PointLight(0xffc070, 0.9, 5);
    lantern.position.set(0.5, 1.0, 0.3);
    g.add(lantern);

    g.position.copy(this.explorerTarget);
    this.explorer = g;
    this.scene.add(g);
  }

  buildTiles() {
    for (let i = 0; i < COUNT; i++) {
      const angle = (i / COUNT) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * RADIUS;
      const z = Math.sin(angle) * RADIUS;

      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.rotation.y = -angle;

      // Pozzo sotto la lastra, illuminato dal basso quando si apre
      const pit = new THREE.Mesh(
        new THREE.BoxGeometry(SLAB, 6, SLAB),
        new THREE.MeshBasicMaterial({ color: 0x050302, side: THREE.BackSide })
      );
      pit.position.y = -3;
      group.add(pit);
      const pitLight = new THREE.PointLight(EMBER, 0, 6);
      pitLight.position.y = -2.5;
      group.add(pitLight);

      // La lastra è fatta di quattro blocchi: crollano separati
      const stoneMat = new THREE.MeshStandardMaterial({ color: STONE, roughness: 0.9, emissive: 0x000000 });
      const pieces = [];
      for (const [px, pz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        const piece = new THREE.Mesh(new THREE.BoxGeometry(PIECE - 0.04, 0.45, PIECE - 0.04), stoneMat);
        const home = new THREE.Vector3(px * PIECE / 2, 0.05, pz * PIECE / 2);
        piece.position.copy(home);
        piece.castShadow = true;
        piece.receiveShadow = true;
        group.add(piece);
        pieces.push({ mesh: piece, home, spin: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5) });
      }

      // Cornice incisa in oro
      const frame = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(SLAB + 0.05, 0.47, SLAB + 0.05)),
        new THREE.LineBasicMaterial({ color: GOLD })
      );
      frame.position.y = 0.05;
      group.add(frame);

      const label = this.createTablet(i + 1, '', 'normal');
      label.position.set(0, 3.1, 0);
      group.add(label);

      const hitBox = new THREE.Mesh(
        new THREE.BoxGeometry(SLAB + 0.4, 3, SLAB + 0.4),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      hitBox.position.y = 1.4;
      hitBox.userData = { tileIndex: i };
      group.add(hitBox);

      this.scene.add(group);
      this.tiles.push({
        index: i, group, pieces, stoneMat, frame, pitLight, label, hitBox,
        position: new THREE.Vector3(x, 0, z),
        text: '', crumbled: false
      });
    }
  }

  buildLights() {
    this.scene.add(new THREE.HemisphereLight(0x9a7c58, 0x1a120a, 0.65));
    this.scene.add(new THREE.AmbientLight(0x3a2a1a, 0.8));

    // Raggio di luce dall'oculo del soffitto
    this.shaft = new THREE.SpotLight(0xfff0d0, 2.4);
    this.shaft.position.set(0, 22, 0);
    this.shaft.angle = Math.PI / 4.2;
    this.shaft.penumbra = 0.7;
    this.shaft.castShadow = true;
    this.scene.add(this.shaft);

    // Luce che segue la lastra in gioco
    this.focus = new THREE.SpotLight(0xffc27a, 0);
    this.focus.position.set(0, 14, 4);
    this.focus.angle = Math.PI / 9;
    this.focus.penumbra = 0.5;
    this.scene.add(this.focus);
    this.scene.add(this.focus.target);
  }

  buildDust() {
    const n = 260;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) positions[i * 3 + 1] = -100;
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.dust = new THREE.Points(geometry, new THREE.PointsMaterial({
      color: 0xc9ad80, size: 0.25, transparent: true, opacity: 0.85
    }));
    this.dustVel = Array.from({ length: n }, () => ({ x: 0, y: 0, z: 0, life: 0 }));
    this.scene.add(this.dust);
  }

  puff(x, z, count = 30, up = 0.05) {
    const pos = this.dust.geometry.attributes.position.array;
    for (let k = 0; k < count; k++) {
      const i = Math.floor(Math.random() * this.dustVel.length);
      pos[i * 3] = x + (Math.random() - 0.5) * SLAB;
      pos[i * 3 + 1] = 0.3;
      pos[i * 3 + 2] = z + (Math.random() - 0.5) * SLAB;
      this.dustVel[i] = {
        x: (Math.random() - 0.5) * 0.06, y: up + Math.random() * 0.05, z: (Math.random() - 0.5) * 0.06, life: 1
      };
    }
  }

  // ---------- Tavolette con le risposte ----------
  createTablet(num, text, state) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');

    const look = {
      normal: { border: '#c9a24a', bg: 'rgba(38, 28, 18, 0.92)', text: '#f4e6c8', sub: '#bda67e', key: 'board3dActive' },
      selected: { border: '#ffcf5a', bg: 'rgba(70, 48, 14, 0.95)', text: '#fff3d6', sub: '#ffcf5a', key: 'board3dChosen' },
      crumbled: { border: '#8c3a24', bg: 'rgba(30, 14, 10, 0.88)', text: '#c98a72', sub: '#e0603c', key: 'board3dWrong' },
      safe: { border: '#7fd67a', bg: 'rgba(20, 44, 18, 0.95)', text: '#f2ffe9', sub: '#9ff08f', key: 'board3dRight' }
    }[state] || {};

    const r = 18;
    ctx.beginPath();
    ctx.moveTo(r, 0); ctx.lineTo(512 - r, 0); ctx.quadraticCurveTo(512, 0, 512, r);
    ctx.lineTo(512, 200 - r); ctx.quadraticCurveTo(512, 200, 512 - r, 200);
    ctx.lineTo(r, 200); ctx.quadraticCurveTo(0, 200, 0, 200 - r);
    ctx.lineTo(0, r); ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.fillStyle = look.bg;
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = look.border;
    ctx.stroke();

    // Numero inciso in un sigillo
    ctx.beginPath();
    ctx.arc(60, 64, 42, 0, Math.PI * 2);
    ctx.fillStyle = look.border;
    ctx.fill();
    ctx.font = 'bold 44px "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#1e140b';
    ctx.fillText(num, 60, 66);

    ctx.font = 'bold 30px "Montserrat", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = look.text;
    const shown = text.length > 25 ? text.substring(0, 23) + '…' : text;
    ctx.fillText(shown, 120, 44);

    ctx.font = 'bold 22px "Montserrat", sans-serif';
    ctx.fillStyle = look.sub;
    ctx.fillText(i18n.t(look.key), 120, 108);

    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true }));
    sprite.scale.set(3.2, 1.25, 1);
    return sprite;
  }

  setTileState(index, state) {
    const tile = this.tiles[index];
    if (!tile) return;
    const fresh = this.createTablet(index + 1, tile.text, state);
    tile.label.material.map = fresh.material.map;
    tile.label.material.map.needsUpdate = true;
  }

  // ---------- API usate dal gioco ----------
  /** Prepara una nuova sala: ricompone le lastre e scrive le 10 risposte. */
  setHall(options, hallNumber) {
    options.forEach((opt, idx) => {
      const tile = this.tiles[idx];
      if (!tile) return;
      tile.text = opt.text;
      tile.crumbled = false;
      tile.group.visible = true;
      tile.pieces.forEach(p => {
        p.mesh.position.copy(p.home);
        p.mesh.rotation.set(0, 0, 0);
        p.mesh.visible = true;
      });
      tile.pitLight.intensity = 0;
      tile.stoneMat.emissive.setHex(0x000000);
      tile.label.visible = true;
      this.setTileState(idx, 'normal');
    });

    // Più si scende, più la sala è buia e le torce arrossano
    const depth = Math.min(Math.max(hallNumber - 1, 0), 9) / 9;
    this.shaft.intensity = 2.4 - depth * 1.2;
    this.scene.fog.density = 0.022 + depth * 0.012;
    this.torches.forEach(t => t.light.color.setRGB(1, 0.42 - depth * 0.18, 0.1));

    this.explorer.visible = true;
    this.explorerFalling = false;
    this.explorerTarget.set(0, 1.1, 0);
    this.explorer.position.copy(this.explorerTarget);
    this.selectedIndex = -1;
    this.focus.intensity = 0;
    this.setCameraOverview();
  }

  moveExplorerTo(index) {
    const tile = this.tiles[index];
    if (!tile) return;
    this.selectedIndex = index;
    this.tiles.forEach((t, i) => {
      if (!t.crumbled) this.setTileState(i, i === index ? 'selected' : 'normal');
    });
    this.explorerTarget.set(tile.position.x, 0.3, tile.position.z);
    this.focus.target.position.copy(tile.position);
    this.focus.intensity = 1.6;
    this.setCameraOnExplorer(index);
  }

  /** Una lastra sbagliata si spezza e i quattro blocchi precipitano nel pozzo. */
  crumbleTile(index, onComplete, { duration = 1100 } = {}) {
    const tile = this.tiles[index];
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      if (onComplete) onComplete();
    };
    if (!tile || tile.crumbled) return finish();

    tile.crumbled = true;
    this.setTileState(index, 'crumbled');
    this.shakeCamera(0.22);
    this.puff(tile.position.x, tile.position.z, 45, 0.07);

    const start = performance.now();
    const safety = setTimeout(() => {
      tile.pieces.forEach(p => { p.mesh.visible = false; });
      finish();
    }, duration + 500);

    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      tile.pieces.forEach((p, k) => {
        const delay = k * 0.08;
        const lt = Math.max(0, (t - delay) / (1 - delay));
        p.mesh.position.y = p.home.y - Math.pow(lt, 2) * 7;
        p.mesh.rotation.set(p.spin.x * lt * 3, p.spin.y * lt * 3, p.spin.z * lt * 3);
        p.mesh.visible = p.mesh.position.y > -6;
      });
      tile.pitLight.intensity = Math.sin(t * Math.PI) * 3.5;
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        clearTimeout(safety);
        tile.pitLight.intensity = 0.6;
        finish();
      }
    };
    requestAnimationFrame(step);
  }

  /** La lastra sotto l'esploratore era quella sbagliata: crolla e lui cade. */
  dropExplorer(onComplete) {
    const index = this.selectedIndex;
    const tile = this.tiles[index];
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      this.explorerFalling = false;
      this.explorer.visible = false;
      if (onComplete) onComplete();
    };
    if (!tile) return finish();

    this.explorerFalling = true;
    this.crumbleTile(index, null, { duration: 1400 });
    this.shakeCamera(0.5);
    const start = performance.now();
    const safety = setTimeout(finish, 2200);
    const step = (now) => {
      const t = Math.min((now - start) / 1500, 1);
      this.explorer.position.y = 0.3 - Math.pow(t * 1.25, 2.4) * 9;
      this.explorer.rotation.z = t * 1.4;
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        clearTimeout(safety);
        finish();
      }
    };
    requestAnimationFrame(step);
  }

  /** La lastra regge: luce verde-oro e scintille. */
  celebrate() {
    this.setTileState(this.selectedIndex, 'safe');
    this.tiles[this.selectedIndex]?.stoneMat.emissive.setHex(0x2a3a10);
    this.focus.color.setHex(0xfff0a0);
    this.focus.intensity = 3;
    const tile = this.tiles[this.selectedIndex];
    if (tile) this.puff(tile.position.x, tile.position.z, 120, 0.12);
    this.dust.material.color.setHex(0xffd36a);
    setTimeout(() => this.dust.material.color.setHex(0xc9ad80), 2500);
  }

  shakeCamera(intensity) {
    this.shake = intensity;
  }

  setTension(on) {
    this.isTense = on;
    if (!on) this.focus.color.setHex(0xffc27a);
  }

  // ---------- Regia ----------
  portraitFactor() {
    const a = this.camera.aspect;
    return a < 1 ? Math.min(2.2, 0.95 / a) : 1;
  }

  setCameraOverview() {
    const k = this.portraitFactor();
    this.targetCameraPos.set(0, 24 * (0.6 + 0.4 * k), 30 * (0.6 + 0.4 * k));
    this.targetLookAt.set(0, 0, 0);
  }

  /** Inquadra una lastra dal centro della sala: più lontano sugli schermi verticali. */
  frameTile(index, distance, height, lookY) {
    const tile = this.tiles[index];
    if (!tile) return;
    const p = tile.position;
    const k = this.portraitFactor() - 1;
    const dir = p.clone().setY(0).normalize();
    const d = distance + 7 * k;
    this.targetCameraPos.set(p.x - dir.x * d, height + 5 * k, p.z - dir.z * d);
    this.targetLookAt.set(p.x, lookY, p.z);
  }

  setCameraOnExplorer(index) {
    this.frameTile(index, 12, 9, 1.2);
  }

  setCameraOnTile(index) {
    this.frameTile(index, 12.5, 10, 0.6);
  }

  // ---------- Input ----------
  onPointerClick(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const boxes = this.tiles.filter(t => !t.crumbled).map(t => t.hitBox);
    const hit = this.raycaster.intersectObjects(boxes)[0];
    if (hit && this.onTileClick) this.onTileClick(hit.object.userData.tileIndex);
  }

  onResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate(time) {
    requestAnimationFrame(this.animate);

    this.camera.position.lerp(this.targetCameraPos, 0.045);
    this.currentLookAt.lerp(this.targetLookAt, 0.045);
    if (!this.explorerFalling) this.explorer.position.lerp(this.explorerTarget, 0.06);

    if (this.shake > 0.001) {
      this.camera.position.add(new THREE.Vector3(
        (Math.random() - 0.5) * this.shake,
        (Math.random() - 0.5) * this.shake,
        (Math.random() - 0.5) * this.shake
      ));
      this.shake *= 0.92;
    }
    this.camera.lookAt(this.currentLookAt);

    // Torce che tremolano e idolo che ruota
    const s = time * 0.001;
    this.torches.forEach(t => {
      const f = 0.85 + Math.sin(s * 9 + t.seed) * 0.08 + Math.sin(s * 23 + t.seed * 3) * 0.05;
      t.light.intensity = 1.6 * f;
      t.flame.scale.set(1, f, 1);
    });
    this.idol.rotation.y = s * 0.8;
    this.idol.position.y = 4.2 + Math.sin(s * 1.6) * 0.15;

    // Polvere
    const pos = this.dust.geometry.attributes.position.array;
    for (let i = 0; i < this.dustVel.length; i++) {
      const v = this.dustVel[i];
      if (v.life <= 0) continue;
      pos[i * 3] += v.x;
      pos[i * 3 + 1] += v.y;
      pos[i * 3 + 2] += v.z;
      v.life -= 0.014;
      if (v.life <= 0) pos[i * 3 + 1] = -100;
    }
    this.dust.geometry.attributes.position.needsUpdate = true;

    if (this.isTense) {
      const pulse = (Math.sin(time * 0.01) + 1) * 0.5;
      this.focus.color.setRGB(1, 0.35 + pulse * 0.25, 0.12);
    }

    this.renderer.render(this.scene, this.camera);
  }
}
