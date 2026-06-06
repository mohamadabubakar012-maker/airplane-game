import { Airplane } from './Airplane.js';
import * as THREE from 'https://unpkg.com';

export class Enemy extends Airplane {
    constructor(game, position) {
        super(game, position, false);
        this.speed = 65; // Slightly slower than player for playability
        this.aiDecisionTimer = 0;
    }

    update(delta) {
        if (this.health <= 0) return;

        this.aiDecisionTimer -= delta;
        if (this.aiDecisionTimer <= 0) {
            this.aiDecisionTimer = Math.random() * 2 + 1; // Change patterns every 1-3 seconds
            
            const playerPos = this.game.player.mesh.position;
            const distance = this.mesh.position.distanceTo(playerPos);

            if (distance < 300) {
                // Evasive maneuvers if player gets close
                this.input.pitch = Math.random() > 0.5 ? 0.5 : -0.5;
                this.input.roll = Math.random() > 0.5 ? 1 : -1;
            } else {
                // Lazy cruise stabilization
                this.input.pitch = 0;
                this.input.roll = (Math.random() - 0.5) * 0.4;
            }
        }

        super.update(delta);
    }
}
