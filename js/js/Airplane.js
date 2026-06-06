import * as THREE from 'https://unpkg.com';
import { Missile } from './Missile.js';

export class Airplane {
    constructor(game, position, isPlayer = false) {
        this.game = game;
        this.isPlayer = isPlayer;
        this.speed = 80;
        this.rotationSpeed = { pitch: 1.5, roll: 2.0, yaw: 1.0 };
        this.input = { pitch: 0, roll: 0, yaw: 0 };
        this.health = 100;

        this.createMesh(position);
        if (this.isPlayer) this.setupControls();
    }

    createMesh(position) {
        this.mesh = new THREE.Group();
        
        // Placeholder procedural Jet geometry (Fuselage + Wings)
        const bodyGeo = new THREE.ConeGeometry(2, 10, 8);
        bodyGeo.rotateX(Math.PI / 2);
        const bodyMat = new THREE.MeshStandardMaterial({ color: this.isPlayer ? 0x3a6073 : 0x8e2de2 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        this.mesh.add(body);

        const wingGeo = new THREE.BoxGeometry(16, 0.2, 3);
        const wing = new THREE.Mesh(wingGeo, bodyMat);
        wing.position.set(0, 0, 1);
        this.mesh.add(wing);

        this.mesh.position.copy(position);
        this.game.scene.add(this.mesh);
    }

    setupControls() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'w') this.input.pitch = -1;
            if (e.key === 's') this.input.pitch = 1;
            if (e.key === 'a') this.input.roll = 1;
            if (e.key === 'd') this.input.roll = -1;
            if (e.key === ' ') this.fireMissile();
        });

        window.addEventListener('keyup', (e) => {
            if (['w', 's'].includes(e.key)) this.input.pitch = 0;
            if (['a', 'd'].includes(e.key)) this.input.roll = 0;
        });
    }

    fireMissile() {
        // Simple radar logic: acquire nearest enemy frontward
        let target = null;
        let closestDist = Infinity;

        this.game.aircraft.forEach(ac => {
            if (ac !== this && ac.health > 0) {
                const dist = this.mesh.position.distanceTo(ac.mesh.position);
                if (dist < closestDist) {
                    closestDist = dist;
                    target = ac;
                }
            }
        });

        const leftWingTip = new THREE.Vector3(-8, 0, 0).applyMatrix4(this.mesh.matrixWorld);
        const missile = new Missile(this.game, leftWingTip, this.mesh.quaternion.clone(), target);
        this.game.missiles.push(missile);
    }

    update(delta) {
        if (this.health <= 0) return;

        // Apply Rotations based on inputs
        this.mesh.rotateX(this.input.pitch * this.rotationSpeed.pitch * delta);
        this.mesh.rotateZ(this.input.roll * this.rotationSpeed.roll * delta);

        // Constant Forward Movement
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.mesh.quaternion);
        this.mesh.position.addScaledVector(forward, this.speed * delta);
    }
}
