// Motore 3D dello studio di Trap10 Quiz

import { i18n } from './i18n.js';
// Renderizza l'arena circolare con le 10 botole delle 10 risposte, il Campione semovente e le eliminazioni spettacolari

export class Studio3D {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.botole = [];
    this.championGroup = null;
    this.championBody = null;
    this.spotlights = [];
    this.particles = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.onBotolaClickCallback = null;

    // Movimento fluido della Camera
    this.targetCameraPos = new THREE.Vector3(0, 24, 30);
    this.targetCameraLookAt = new THREE.Vector3(0, 0, 0);
    this.currentCameraLookAt = new THREE.Vector3(0, 0, 0);
    this.cameraShakeIntensity = 0;

    // Posizione del Campione nel 3D (inizialmente al centro, poi sopra la botola scelta)
    this.championTargetPos = new THREE.Vector3(0, 0.5, 0);

    this.selectedBotolaIndex = -1;
    this.isTense = false;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // Scena Studio Televisivo
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x040814);
    this.scene.fog = new THREE.FogExp2(0x040814, 0.02);

    // Camera Prospettica
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 200);
    this.camera.position.set(0, 26, 32);
    this.currentCameraLookAt.set(0, 0, 0);
    this.camera.lookAt(this.currentCameraLookAt);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Costruzione Studio TV
    this.buildStudioFloor();
    this.buildChampionPodium();
    this.build10Botole();
    this.setupLighting();
    this.setupParticleSystem();

    // Eventi
    window.addEventListener('resize', () => this.onResize());
    this.renderer.domElement.addEventListener('click', (e) => this.onPointerClick(e));
    this.renderer.domElement.addEventListener('mousemove', (e) => this.onPointerMove(e));

    // Render loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  buildStudioFloor() {
    // Pavimento nero lucido
    const floorGeo = new THREE.CylinderGeometry(20, 20, 0.4, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x070c1a,
      roughness: 0.15,
      metalness: 0.85
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Anelli LED concentrici dello studio
    const rings = [
      { r: 5.5, color: 0x00d2ff, width: 0.2 },
      { r: 12.0, color: 0x0066ff, width: 0.25 },
      { r: 17.5, color: 0xffaa00, width: 0.3 }
    ];

    rings.forEach(ring => {
      const geo = new THREE.RingGeometry(ring.r - ring.width, ring.r + ring.width, 64);
      const mat = new THREE.MeshBasicMaterial({ color: ring.color, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.y = 0.02;
      this.scene.add(mesh);
    });

    // Parete perimetrale dello studio
    const wallGeo = new THREE.CylinderGeometry(22, 22, 5, 64, 1, true);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x060b18,
      roughness: 0.7,
      metalness: 0.2,
      side: THREE.BackSide
    });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.y = 2.2;
    this.scene.add(wall);
  }

  buildChampionPodium() {
    // Podio centrale
    const group = new THREE.Group();
    const baseGeo = new THREE.CylinderGeometry(3.0, 3.4, 0.5, 48);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x111e38,
      roughness: 0.2,
      metalness: 0.8
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.25;
    group.add(base);

    // Bordo dorato
    const borderGeo = new THREE.TorusGeometry(3.05, 0.08, 16, 64);
    const borderMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const border = new THREE.Mesh(borderGeo, borderMat);
    border.rotation.x = Math.PI / 2;
    border.position.y = 0.51;
    group.add(border);

    this.scene.add(group);

    // Sagoma 3D del Campione (che si sposta fisicamente sulla botola scelta)
    this.championGroup = new THREE.Group();
    this.championGroup.position.set(0, 0.5, 0);

    // Corpo
    const bodyGeo = new THREE.CylinderGeometry(0.35, 0.45, 1.4, 24);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0055ff,
      roughness: 0.3,
      metalness: 0.5
    });
    this.championBody = new THREE.Mesh(bodyGeo, bodyMat);
    this.championBody.position.y = 0.7;
    this.championBody.castShadow = true;
    this.championGroup.add(this.championBody);

    // Testa
    const headGeo = new THREE.SphereGeometry(0.3, 24, 24);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffd5b8, roughness: 0.5 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.6;
    head.castShadow = true;
    this.championGroup.add(head);

    // Corona / Aureola dorata Campione
    const crownGeo = new THREE.TorusGeometry(0.38, 0.04, 16, 32);
    const crownMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const crown = new THREE.Mesh(crownGeo, crownMat);
    crown.rotation.x = Math.PI / 2;
    crown.position.y = 2.05;
    this.championGroup.add(crown);

    // Cartello fluttuante 'IL CAMPIONE'
    const nameSprite = this.createTextBadge("★ TRAP10 ★", "#ffd700", "#081636");
    nameSprite.position.set(0, 2.5, 0);
    nameSprite.scale.set(2.2, 0.7, 1);
    this.championGroup.add(nameSprite);

    this.scene.add(this.championGroup);
  }

  // Costruzione delle 10 Botole delle 10 Risposte
  build10Botole() {
    const radius = 13.5;
    const count = 10;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const botolaGroup = new THREE.Group();
      botolaGroup.position.set(x, 0, z);

      // Pozzo del vuoto sottostante (abisso)
      const pitGeo = new THREE.CylinderGeometry(1.45, 1.45, 6, 32, 1, true);
      const pitMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });
      const pitMesh = new THREE.Mesh(pitGeo, pitMat);
      pitMesh.position.y = -3;
      botolaGroup.add(pitMesh);

      // Luce d'abisso
      const pitLight = new THREE.PointLight(0xff1100, 0, 4);
      pitLight.position.y = -2;
      botolaGroup.add(pitLight);

      // Anello LED della botola
      const rimGeo = new THREE.TorusGeometry(1.5, 0.08, 16, 48);
      const rimMat = new THREE.MeshStandardMaterial({
        color: 0x00d2ff,
        emissive: 0x0066aa,
        emissiveIntensity: 0.6,
        roughness: 0.2
      });
      const rimMesh = new THREE.Mesh(rimGeo, rimMat);
      rimMesh.rotation.x = Math.PI / 2;
      rimMesh.position.y = 0.05;
      botolaGroup.add(rimMesh);

      // Ante della botola (due semicerchi imperniati)
      const flapGeo = new THREE.CircleGeometry(1.4, 24, 0, Math.PI);
      const flapMat = new THREE.MeshStandardMaterial({
        color: 0x141f36,
        roughness: 0.35,
        metalness: 0.8,
        side: THREE.DoubleSide
      });

      // Anta sinistra
      const leftHinge = new THREE.Group();
      leftHinge.position.set(-1.4, 0.04, 0);
      const leftFlap = new THREE.Mesh(flapGeo, flapMat);
      leftFlap.rotation.x = -Math.PI / 2;
      leftFlap.position.x = 1.4;
      leftHinge.add(leftFlap);
      botolaGroup.add(leftHinge);

      // Anta destra
      const rightHinge = new THREE.Group();
      rightHinge.position.set(1.4, 0.04, 0);
      const rightFlap = new THREE.Mesh(flapGeo, flapMat);
      rightFlap.rotation.x = -Math.PI / 2;
      rightFlap.rotation.z = Math.PI;
      rightFlap.position.x = -1.4;
      rightHinge.add(rightFlap);
      botolaGroup.add(rightHinge);

      // Tabellone 3D fluttuante per la risposta (Numero + Testo Opzione)
      const labelSprite = this.createBotolaOptionBillboard(i + 1, `Opzione ${i + 1}`);
      labelSprite.position.set(0, 2.2, 0);
      botolaGroup.add(labelSprite);

      // Hitbox per click
      const hitBoxGeo = new THREE.CylinderGeometry(1.6, 1.6, 3, 16);
      const hitBoxMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitBox = new THREE.Mesh(hitBoxGeo, hitBoxMat);
      hitBox.position.y = 1.5;
      hitBox.userData = { botolaIndex: i };
      botolaGroup.add(hitBox);

      this.scene.add(botolaGroup);

      this.botole.push({
        index: i,
        group: botolaGroup,
        leftHinge,
        rightHinge,
        rimMesh,
        rimMat,
        pitLight,
        labelSprite,
        hitBox,
        position: new THREE.Vector3(x, 0, z),
        isOpen: false,
        isEliminated: false,
        optionText: `Opzione ${i + 1}`
      });
    }
  }

  // Crea una texture 2D disegnata su canvas per il tabellone 3D dell'opzione
  createBotolaOptionBillboard(num, text, state = 'normal') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');

    // Sfondo badge
    ctx.clearRect(0, 0, 512, 200);

    let borderColor = '#00d2ff';
    let bgColor = 'rgba(6, 18, 42, 0.9)';
    let textColor = '#ffffff';

    if (state === 'selected') {
      borderColor = '#ffd700';
      bgColor = 'rgba(40, 28, 6, 0.95)';
      textColor = '#fffbdf';
    } else if (state === 'eliminated') {
      borderColor = '#ff2222';
      bgColor = 'rgba(40, 6, 6, 0.9)';
      textColor = '#ff6666';
    } else if (state === 'winner') {
      borderColor = '#00ff88';
      bgColor = 'rgba(6, 40, 20, 0.95)';
      textColor = '#ffffff';
    }

    // Rettangolo arrotondato
    const r = 24;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(512 - r, 0);
    ctx.quadraticCurveTo(512, 0, 512, r);
    ctx.lineTo(512, 200 - r);
    ctx.quadraticCurveTo(512, 200, 512 - r, 200);
    ctx.lineTo(r, 200);
    ctx.quadraticCurveTo(0, 200, 0, 200 - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();

    ctx.fillStyle = bgColor;
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = borderColor;
    ctx.stroke();

    // Numero Botola (badge tondo a sinistra)
    ctx.beginPath();
    ctx.arc(60, 60, 42, 0, Math.PI * 2);
    ctx.fillStyle = borderColor;
    ctx.fill();

    ctx.font = 'bold 44px "Orbitron", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#040919';
    ctx.fillText(num, 60, 60);

    // Titolo / Testo della risposta
    ctx.font = 'bold 30px "Montserrat", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = textColor;
    
    // Taglia se troppo lungo
    let displayTxt = text;
    if (displayTxt.length > 25) {
      displayTxt = displayTxt.substring(0, 23) + '...';
    }
    ctx.fillText(displayTxt, 120, 44);

    // Sottotitolo di stato
    ctx.font = 'bold 22px "Rajdhani", sans-serif';
    if (state === 'selected') {
      ctx.fillStyle = '#ffd700';
      ctx.fillText(i18n.t('board3dChosen'), 120, 105);
    } else if (state === 'eliminated') {
      ctx.fillStyle = '#ff3333';
      ctx.fillText(i18n.t('board3dWrong'), 120, 105);
    } else if (state === 'winner') {
      ctx.fillStyle = '#00ff88';
      ctx.fillText(i18n.t('board3dRight'), 120, 105);
    } else {
      ctx.fillStyle = '#94a9cc';
      ctx.fillText(i18n.t('board3dActive'), 120, 105);
    }

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(3.2, 1.25, 1);
    return sprite;
  }

  createTextBadge(text, color, bg) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 256, 80);
    ctx.lineWidth = 4;
    ctx.strokeStyle = color;
    ctx.strokeRect(0, 0, 256, 80);

    ctx.font = 'bold 30px "Orbitron", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
    ctx.fillText(text, 128, 40);

    const texture = new THREE.CanvasTexture(canvas);
    return new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
  }

  // Carica le 10 risposte della domanda corrente sui cartelloni 3D
  setQuestionOptions(options) {
    options.forEach((opt, idx) => {
      const botola = this.botole[idx];
      if (botola) {
        botola.optionText = opt.text;
        botola.isOpen = false;
        botola.isEliminated = false;
        botola.leftHinge.rotation.z = 0;
        botola.rightHinge.rotation.z = 0;
        botola.rimMat.color.setHex(0x00d2ff);
        botola.rimMat.emissive.setHex(0x0066aa);

        this.updateBotolaLabel(idx, 'normal');
      }
    });

    // Riporta Campione al centro
    if (this.championGroup) {
      this.championGroup.visible = true;
      this.championGroup.position.set(0, 0.5, 0);
    }
    this.championDropping = false;
    this.championTargetPos.set(0, 0.5, 0);
    this.selectedBotolaIndex = -1;
    this.setCameraOverview();
  }

  updateBotolaLabel(index, state) {
    const botola = this.botole[index];
    if (!botola) return;

    const newSprite = this.createBotolaOptionBillboard(index + 1, botola.optionText, state);
    botola.labelSprite.material.map = newSprite.material.map;
    botola.labelSprite.material.map.needsUpdate = true;
  }

  // Sposta fisicamente il Campione sopra la botola selezionata!
  moveChampionToBotola(botolaIndex) {
    this.selectedBotolaIndex = botolaIndex;
    const botola = this.botole[botolaIndex];
    if (!botola) return;

    // Aggiorna grafica cartelloni
    this.botole.forEach((b, i) => {
      if (!b.isEliminated) {
        this.updateBotolaLabel(i, i === botolaIndex ? 'selected' : 'normal');
      }
    });

    // Muovi il Campione sopra la botola
    this.championTargetPos.set(botola.position.x, 0.1, botola.position.z);

    // Inquadratura cinematografica sul Campione posizionato sulla botola scelta
    this.setCameraChampionOnBotola(botolaIndex);
  }

  setupLighting() {
    // Luce ambientale notturna
    const ambientLight = new THREE.AmbientLight(0x0e1830, 1.4);
    this.scene.add(ambientLight);

    // Faro centrale
    this.centerSpot = new THREE.SpotLight(0xffea9f, 3.5);
    this.centerSpot.position.set(0, 18, 0);
    this.centerSpot.angle = Math.PI / 4;
    this.centerSpot.penumbra = 0.6;
    this.centerSpot.castShadow = true;
    this.scene.add(this.centerSpot);

    // Faro mobile di tensione
    this.tensionSpot = new THREE.SpotLight(0x00d2ff, 4.0);
    this.tensionSpot.position.set(0, 16, 5);
    this.tensionSpot.angle = Math.PI / 5;
    this.tensionSpot.penumbra = 0.5;
    this.scene.add(this.tensionSpot);
  }

  setupParticleSystem() {
    const particleCount = 250;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = -100;
      positions[i * 3 + 2] = 0;
      velocities.push({
        x: (Math.random() - 0.5) * 0.05,
        y: 0.04 + Math.random() * 0.06,
        z: (Math.random() - 0.5) * 0.05,
        life: 0
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x88ccff,
      size: 0.22,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    this.particleMesh = new THREE.Points(geometry, material);
    this.particleVelocities = velocities;
    this.scene.add(this.particleMesh);
  }

  burstSmoke(x, z) {
    const positions = this.particleMesh.geometry.attributes.position.array;
    for (let i = 0; i < 40; i++) {
      const idx = Math.floor(Math.random() * (positions.length / 3));
      positions[idx * 3] = x + (Math.random() - 0.5) * 1.5;
      positions[idx * 3 + 1] = 0.1;
      positions[idx * 3 + 2] = z + (Math.random() - 0.5) * 1.5;
      this.particleVelocities[idx].life = 1.0;
      this.particleVelocities[idx].x = (Math.random() - 0.5) * 0.08;
      this.particleVelocities[idx].y = 0.06 + Math.random() * 0.08;
      this.particleVelocities[idx].z = (Math.random() - 0.5) * 0.08;
    }
    this.particleMesh.geometry.attributes.position.needsUpdate = true;
  }

  // APERTURA DI UNA BOTOLA ERRATA
  eliminateBotola(botolaIndex, onComplete) {
    let completed = false;
    const finish = () => {
      if (completed) return;
      completed = true;
      if (onComplete) onComplete();
    };

    const botola = this.botole[botolaIndex];
    if (!botola) {
      finish();
      return;
    }
    if (botola.isOpen) {
      finish();
      return;
    }

    botola.isOpen = true;
    botola.isEliminated = true;
    this.updateBotolaLabel(botolaIndex, 'eliminated');
    this.cameraShake(0.25);

    // Inquadra la botola che viene aperta
    this.setCameraOnSpecificBotola(botolaIndex);

    let start = performance.now();
    const duration = 1200;

    // Timer di sicurezza se requestAnimationFrame viene interrotto
    const safetyTimer = setTimeout(() => {
      botola.leftHinge.rotation.z = Math.PI / 2;
      botola.rightHinge.rotation.z = -Math.PI / 2;
      botola.rimMat.color.setHex(0xff1100);
      botola.rimMat.emissive.setHex(0x550000);
      finish();
    }, duration + 400);

    const animateDrop = (time) => {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1.0);

      const hingeAngle = Math.min(progress * 2.5, 1.0) * (Math.PI / 2);
      botola.leftHinge.rotation.z = hingeAngle;
      botola.rightHinge.rotation.z = -hingeAngle;

      botola.pitLight.intensity = Math.sin(progress * Math.PI) * 3.5;

      if (progress > 0.1 && progress < 0.6) {
        this.burstSmoke(botola.position.x, botola.position.z);
      }

      if (progress < 1.0) {
        requestAnimationFrame(animateDrop);
      } else {
        clearTimeout(safetyTimer);
        botola.rimMat.color.setHex(0xff1100);
        botola.rimMat.emissive.setHex(0x550000);
        finish();
      }
    };

    requestAnimationFrame(animateDrop);
  }

  // PRECIPITAZIONE DEL CAMPIONE SE LA RISPOSTA SCELTA È SBAGLIATA!
  dropChampion(championBotolaIndex, onComplete) {
    let callback = onComplete;
    let bIdx = championBotolaIndex;
    if (typeof championBotolaIndex === 'function') {
      callback = championBotolaIndex;
      bIdx = this.selectedBotolaIndex;
    }
    if (bIdx === undefined || bIdx < 0) {
      bIdx = this.selectedBotolaIndex;
    }

    let completed = false;
    const finish = () => {
      if (completed) return;
      completed = true;
      this.championDropping = false;
      if (this.championGroup) this.championGroup.visible = false;
      if (callback) callback();
    };

    const botola = this.botole[bIdx];
    if (!botola) {
      finish();
      return;
    }

    this.championDropping = true;
    botola.isOpen = true;
    this.cameraShake(0.5);

    let start = performance.now();
    const duration = 1500;

    // Safety fallback
    const safetyTimer = setTimeout(() => {
      finish();
    }, duration + 500);

    const animateChampDrop = (time) => {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1.0);

      const hingeAngle = Math.min(progress * 2.5, 1.0) * (Math.PI / 2);
      botola.leftHinge.rotation.z = hingeAngle;
      botola.rightHinge.rotation.z = -hingeAngle;

      // Il Campione cade a piombo nel pozzo!
      const fallDist = Math.pow(progress * 1.3, 2.5) * 9.0;
      this.championGroup.position.y = -fallDist;

      this.burstSmoke(botola.position.x, botola.position.z);

      if (progress < 1.0) {
        requestAnimationFrame(animateChampDrop);
      } else {
        clearTimeout(safetyTimer);
        finish();
      }
    };

    requestAnimationFrame(animateChampDrop);
  }

  // TRIONFO DEL CAMPIONE (RISPOSTA CORRETTA!)
  celebrateChampion() {
    const botolaIndex = this.selectedBotolaIndex;
    this.updateBotolaLabel(botolaIndex, 'winner');

    // Aura dorata
    this.tensionSpot.color.setHex(0xffd700);
    this.tensionSpot.intensity = 6;
    this.centerSpot.color.setHex(0xffffff);

    // Emetti particelle dorate verso l'alto
    const positions = this.particleMesh.geometry.attributes.position.array;
    for (let i = 0; i < positions.length / 3; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = Math.random() * 4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
      this.particleVelocities[i].life = 2.0;
      this.particleVelocities[i].y = 0.1 + Math.random() * 0.1;
    }
    this.particleMesh.material.color.setHex(0xffd700);
    this.particleMesh.geometry.attributes.position.needsUpdate = true;
  }

  cameraShake(intensity) {
    this.cameraShakeIntensity = intensity;
  }

  // REGIA TELECAMERE
  // Su schermo verticale (telefono) l'inquadratura orizzontale è stretta: la telecamera si allontana
  portraitFactor() {
    const a = this.camera.aspect;
    return a < 1 ? Math.min(2.2, 0.95 / a) : 1;
  }

  setCameraOverview() {
    const k = this.portraitFactor();
    this.targetCameraPos.set(0, 24 * (0.6 + 0.4 * k), 30 * (0.6 + 0.4 * k));
    this.targetCameraLookAt.set(0, 0, 0);
  }

  setCameraChampionOnBotola(botolaIndex) {
    const botola = this.botole[botolaIndex];
    if (!botola) return;
    const bPos = botola.position;
    const k = this.portraitFactor() - 1;

    // Telecamera ravvicinata sul Campione che presidia la botola
    const f = 0.55 - 0.5 * k;
    this.targetCameraPos.set(bPos.x * f, 6.0 + 6 * k, bPos.z * f);
    this.targetCameraLookAt.set(bPos.x, 1.8 - k, bPos.z);

    this.tensionSpot.target = botola.group;
  }

  setCameraOnSpecificBotola(botolaIndex) {
    const botola = this.botole[botolaIndex];
    if (!botola) return;
    const bPos = botola.position;
    const k = this.portraitFactor() - 1;

    const f = 0.6 - 0.5 * k;
    this.targetCameraPos.set(bPos.x * f, 7.5 + 6 * k, bPos.z * f);
    this.targetCameraLookAt.set(bPos.x, 0.5, bPos.z);
  }

  setTensionMode(isTense) {
    this.isTense = isTense;
  }

  // Interazioni
  onPointerMove(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  onPointerClick(event) {
    this.onPointerMove(event);
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const hitBoxes = this.botole
      .filter(b => !b.isEliminated)
      .map(b => b.hitBox);

    const intersects = this.raycaster.intersectObjects(hitBoxes);
    if (intersects.length > 0) {
      const idx = intersects[0].object.userData.botolaIndex;
      if (this.onBotolaClickCallback) {
        this.onBotolaClickCallback(idx);
      }
    }
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

    // Interpolazione fluida Camera
    this.camera.position.lerp(this.targetCameraPos, 0.045);
    this.currentCameraLookAt.lerp(this.targetCameraLookAt, 0.045);

    // Movimento fluido del Campione verso la botola scelta (solo se non sta cadendo!)
    if (!this.championDropping) {
      this.championGroup.position.lerp(this.championTargetPos, 0.06);
    }

    // Scuotimento camera
    let shakeOffset = new THREE.Vector3(0, 0, 0);
    if (this.cameraShakeIntensity > 0.001) {
      shakeOffset.set(
        (Math.random() - 0.5) * this.cameraShakeIntensity,
        (Math.random() - 0.5) * this.cameraShakeIntensity,
        (Math.random() - 0.5) * this.cameraShakeIntensity
      );
      this.cameraShakeIntensity *= 0.92;
    }

    this.camera.position.add(shakeOffset);
    this.camera.lookAt(this.currentCameraLookAt);

    // Particelle
    if (this.particleMesh) {
      const positions = this.particleMesh.geometry.attributes.position.array;
      for (let i = 0; i < this.particleVelocities.length; i++) {
        const vel = this.particleVelocities[i];
        if (vel.life > 0) {
          positions[i * 3] += vel.x;
          positions[i * 3 + 1] += vel.y;
          positions[i * 3 + 2] += vel.z;
          vel.life -= 0.015;
          if (vel.life <= 0) {
            positions[i * 3 + 1] = -100;
          }
        }
      }
      this.particleMesh.geometry.attributes.position.needsUpdate = true;
    }

    // Luci di tensione
    if (this.isTense) {
      const pulse = (Math.sin(time * 0.01) + 1) * 0.5;
      this.tensionSpot.color.setRGB(1.0, 0.3 + pulse * 0.3, 0.1);
    }

    this.renderer.render(this.scene, this.camera);
  }
}
