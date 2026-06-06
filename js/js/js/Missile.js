import * as THREE from 'https://unpkg.com';

export class Missile {
    constructor(game, position, quaternion, target = null) {
        this.game = game;
        this.target = target;
        this.speed = 180;
        this.turnRate = 2.5; 
        this.lifeTime = 4.0; 
        this.isDead = false;

        this.mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.2, 3, 6),
            new THREE.MeshBasicMaterial({ color: 0xff3333 })
        );
        this.mesh.geometry.rotateX(Math.PI / 2);
        this.mesh.position.copy(position);
        this.mesh.quaternion.copy(quaternion);
        
        this.game.scene.add(this.mesh);
    }

    update(delta) {
        this.lifeTime -= delta;
        if (this.lifeTime <= 0) {
            this.isDead = true;
            return;
        }

        if (this.target && this.target.health > 0) {
            // Self-homing vector tracking guidance calculation
            const targetPos = this.target.mesh.position;
            const desiredDirection = new THREE.Vector3().subVectors(targetPos, this.mesh.position).normalize();
            
            const currentDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(this.mesh.quaternion);
            
            // Spherical linear interpolation towards target vector
            const slerpTarget = new THREE.Quaternion().setFromUnitVectors(currentDirection, desiredDirection);
            this.mesh.quaternion.slerp(slerpTarget.multiply(this.mesh.quaternion), this.turnRate * delta);

            // Proximity explosion check
            if (this.mesh.position.distanceTo(targetPos) < 8) {
                this.target.health -= 50; 
                if(this.target.health <= 0) this.game.scene.remove(this.target.mesh);
                this.isDead = true;
                return;
            }
        }

        // Push missile forward
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.mesh.quaternion);
        this.mesh.position.addScaledVector(forward, this.speed * delta);
    }
}
