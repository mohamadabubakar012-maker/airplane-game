import * as THREE from 'https://unpkg.com';
import { Airplane } from './Airplane.js';
import { Enemy } from './Enemy.js';

class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        
        this.aircraft = [];
        this.missiles = [];
        this.player = null;

        this.init();
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);

        // Environment Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);
        
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(100, 300, 100);
        this.scene.add(dirLight);

        // Spawn Player
        this.player = new Airplane(this, new THREE.Vector3(0, 100, 0), true);
        this.aircraft.push(this.player);

        // Spawn Enemies
        for (let i = 0; i < 5; i++) {
            const spawnPos = new THREE.Vector3((Math.random() - 0.5) * 500, 100, -300 - Math.random() * 500);
            const enemy = new Enemy(this, spawnPos);
            this.aircraft.push(enemy);
        }

        window.addEventListener('resize', () => this.onWindowResize());
        this.animate();
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = 0.016; // Standard frame step (~60fps)

        // Update all entities
        this.aircraft.forEach(ac => ac.update(delta));
        this.missiles.forEach((missile, index) => {
            missile.update(delta);
            if (missile.isDead) {
                this.scene.remove(missile.mesh);
                this.missiles.splice(index, 1);
            }
        });

        // Third-person camera tracking
        if (this.player) {
            const relativeCameraOffset = new THREE.Vector3(0, 15, 40);
            const cameraOffset = relativeCameraOffset.applyMatrix4(this.player.mesh.matrixWorld);
            this.camera.position.lerp(cameraOffset, 0.1);
            this.camera.lookAt(this.player.mesh.position.clone().add(new THREE.Vector3(0, 2, -20)));
        }

        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

new Game();
