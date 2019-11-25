import { mat4 } from 'gl-matrix';

import { GLUtilities, gl } from './gl/gl';
import { BasicShader } from './gl/shaders/basicShader';
import { Sprite } from './graphics/sprite';
import { AssetManager } from './assets/assetManager';
import { MessageBus } from './message/messageBus';
import { MaterialManager } from './graphics/materialManager';
import { Material } from './graphics/material';
import { Color } from './graphics/color';
import { ZoneManager } from './world/zoneManager';
import { ZoneState } from './world/zone';

export class XGLEngine {

    private _canvas: HTMLCanvasElement;
    private _basicShader: BasicShader;

    private _projection: mat4;

    public constructor() { }

    public start(): void {

        this._canvas = GLUtilities.init();

        AssetManager.initialize();

        this._basicShader = new BasicShader();
        this._basicShader.use();

        MaterialManager.registerMaterial(new Material('crate', 'assets/textures/test.jpg', new Color(255, 255, 255, 255)));

        const zoneID = ZoneManager.createTestZone();

        this._projection = this.createProjection();
        ZoneManager.changeZone(zoneID);

        this.resize();
        this.loop();
    }

    /**
     * Resizes to fit the window.
     */
    public resize(): void {
        if (this._canvas !== undefined) {
            this._canvas.width = window.innerWidth;
            this._canvas.height = window.innerHeight;

            // Defining the max area of the screen
            gl.viewport(0, 0, this._canvas.width, this._canvas.height);
            this._projection = this.createProjection();

        }
    }

    private loop(): void {

        MessageBus.update(0);

        ZoneManager.update(0);

        GLUtilities.clearFrame();

        ZoneManager.render(this._basicShader);

        const projectionPosition = this._basicShader.getUniformLocation('u_projection');
        gl.uniformMatrix4fv(projectionPosition, false, this._projection);

        requestAnimationFrame(this.loop.bind(this));
    }

    private createProjection(): mat4 {
        let m: mat4 = mat4.create();

        return mat4.ortho(m, 0, this._canvas.width, this._canvas.height, 0, -100.0, 100.0);
    }
}