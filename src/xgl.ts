import { mat4 } from 'gl-matrix';

import { GLUtilities, gl } from './gl/gl';
import { BasicShader } from './gl/shaders/basicShader';
import { SpriteComponentBuilder } from './components/spriteComponent';
import { AnimatedSpriteComponentBuilder } from './components/animatedSpriteComponent';
import { AssetManager } from './assets/assetManager';
import { MessageBus } from './message/messageBus';
import { MaterialManager } from './graphics/materialManager';
import { Material } from './graphics/material';
import { Color } from './graphics/color';
import { ZoneManager } from './world/zoneManager';
import { ComponentManager } from './components/componentManager';
import { BehaviorManager } from './behaviors/behaviorManager';
import { RotationBehaviorBuilder } from './behaviors/rotationBehavior';
import { KeyboardMovementBehaviorBuilder } from './behaviors/keyboardMovementBehavior';
import { InputManager, MouseContext } from './input/inputManager';
import { IMessageHandler } from './message/IMessageHandler';
import { Message } from './message/message';
import { AudioManager } from './audio/audioManager';
import { CollisionComponentBuilder } from './components/collisionComponent';
import { CollisionManager } from './collision/CollisionManager';
import { PlayerBehaviorBuilder } from './behaviors/PlayerBehavior';
import { ScrollBehaviorBuilder } from './behaviors/ScrollBehavior';

export class XGLEngine implements IMessageHandler {
    private _canvas: HTMLCanvasElement;
    private _basicShader: BasicShader;
    private _projection: mat4;
    private _previousTime: number = 0;
    private _gameWidth: number;
    private _gameHeight: number;

    public constructor(width?: number, height?: number) {
        if (width) this._gameWidth = width;
        if (height) this._gameHeight = height;
    }

    public start(): void {

        this._canvas = GLUtilities.init();

        if (this._gameWidth !== undefined && this._gameHeight !== undefined) {
            this._canvas.style.width = this._gameWidth + "px";
            this._canvas.style.height = this._gameHeight + "px";
            this._canvas.width = this._gameWidth;
            this._canvas.height = this._gameHeight;
        }

        ComponentManager.registerBuilder(new SpriteComponentBuilder());
        ComponentManager.registerBuilder(new AnimatedSpriteComponentBuilder());
        ComponentManager.registerBuilder(new CollisionComponentBuilder());

        BehaviorManager.registerBuilder(new RotationBehaviorBuilder());
        BehaviorManager.registerBuilder(new KeyboardMovementBehaviorBuilder());
        BehaviorManager.registerBuilder(new PlayerBehaviorBuilder());
        BehaviorManager.registerBuilder(new ScrollBehaviorBuilder());

        AssetManager.initialize();
        InputManager.initialize();
        ZoneManager.initialize();

        this._basicShader = new BasicShader();
        this._basicShader.use();

        // TODO: This should not be here. This is part of the game
        MaterialManager.registerMaterial(new Material('bg', 'assets/textures/bg.png', new Color(255, 255, 255, 255)));
        MaterialManager.registerMaterial(new Material('end', 'assets/textures/end.png', new Color(255, 255, 255, 255)));
        MaterialManager.registerMaterial(new Material('middle', 'assets/textures/middle.png', new Color(255, 255, 255, 255)));

        MaterialManager.registerMaterial(new Material('grass', 'assets/textures/grass.png', new Color(255, 255, 255, 255)));
        MaterialManager.registerMaterial(new Material('duck', 'assets/textures/duck.png', new Color(255, 255, 255, 255)));

        AudioManager.loadSoundFile('flap', 'assets/sounds/flap.mp3', false);
        AudioManager.loadSoundFile('ting', 'assets/sounds/ting.mp3', false);
        AudioManager.loadSoundFile('dead', 'assets/sounds/dead.mp3', false);

        this._projection = this.createProjection();

        ZoneManager.changeZone(0);

        this.resize();
        this.loop();
    }

    /**
     * Resizes to fit the window.
     */
    public resize(): void {
        if (this._canvas !== undefined) {
            if (this._gameWidth === undefined || this._gameHeight === undefined) {
                this._canvas.width = window.innerWidth;
                this._canvas.height = window.innerHeight;
            }

            // Defining the max area of the screen
            gl.viewport(0, 0, this._canvas.width, this._canvas.height);
            this._projection = this.createProjection();

        }
    }

    public onMessage(message: Message): void {
        if (message.code === 'MOUSE_UP') {
            const context = message.context as MouseContext;
            document.title = `Pos: [${context.position.x}], [${context.position.y}]`;
        }
    }

    private loop(): void {
        this.update();
        this.render();
    }

    private update(): void {
        const delta = performance.now() - this._previousTime;

        MessageBus.update(delta);
        ZoneManager.update(delta);
        CollisionManager.update(delta);

        this._previousTime = performance.now();
    }

    private render(): void {
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

