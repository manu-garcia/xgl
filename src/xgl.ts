import { mat4 } from 'gl-matrix';

import { GLUtilities, gl } from './gl/gl';
import { BasicShader } from './gl/shaders/basicShader';
import { SpriteComponentBuilder } from './components/spriteComponent';
import { AnimatedSpriteComponentBuilder } from './components/animatedSpriteComponent';
import { AssetManager } from './assets/assetManager';
import { MessageBus } from './message/messageBus';
import { MaterialManager } from './graphics/materialManager';
import { Material } from './graphics/material';
import { ZoneManager } from './world/zoneManager';
import { ComponentManager } from './components/componentManager';
import { BehaviorManager } from './behaviors/behaviorManager';
import { RotationBehaviorBuilder } from './behaviors/rotationBehavior';
import { KeyboardMovementBehaviorBuilder } from './behaviors/keyboardMovementBehavior';
import { InputManager } from './input/inputManager';
import { IMessageHandler } from './message/IMessageHandler';
import { Message } from './message/message';
import { AudioManager } from './audio/audioManager';
import { CollisionComponentBuilder } from './components/collisionComponent';
import { CollisionManager } from './collision/CollisionManager';
import { ScrollBehaviorBuilder } from './behaviors/ScrollBehavior';
import { BitmapFontManager } from './graphics/BitmapFontManager';
import { BitmapTextComponentBuilder } from './components/BitmapTextComponent';
import { MouseClickBehaviorBuilder } from './behaviors/MouseClickBehavior';
import { VisibilityOnMessageBehaviorBuilder } from './behaviors/VisibilityOnMessageBehavior';
import { Matrix4x4 } from './math/matrix4x4';
import { Vector2 } from './math/vector2';
import { IBehaviorBuilder } from './behaviors/IBehaviorBuilder';
import { IBitmapFontAsset } from './graphics/IBitmapFontAsset';
import { ISoundAsset } from './audio/ISoundAsset';

export abstract class XGLEngine implements IMessageHandler {
    private _canvas: HTMLCanvasElement;
    private _basicShader: BasicShader;
    private _projection: Matrix4x4;
    private _previousTime: number = 0;
    private _gameWidth: number;
    private _gameHeight: number;

    private _isFirstUpdate: boolean = true;
    private _aspect: number;

    public constructor(width?: number, height?: number) {
        if (width) this._gameWidth = width;
        if (height) this._gameHeight = height;
    }

    public start(elementName?: string): void {

        this._canvas = GLUtilities.init(elementName);

        if (this._gameWidth !== undefined && this._gameHeight !== undefined) {
            this._aspect = this._gameWidth / this._gameHeight;
        }

        this.registerComponents();
        this.registerBuilders();
        this.registerBehaviors();

        AssetManager.initialize();
        InputManager.initialize(this._canvas);
        ZoneManager.initialize();

        this._basicShader = new BasicShader();
        this._basicShader.use();

        this.registerFonts();
        this.registerMaterials();
        this.registersounds();

        this._projection = Matrix4x4.orthographic(0, this._canvas.width, this._canvas.height, 0, -100.0, 100.0);

        this.resize();

        // Begin preloading phase waiting for all assets to be loaded before starting the game
        this.preloading();
    }

    /**
     * Resizes to fit the window.
     */
    public resize(): void {
        if (this._canvas !== undefined) {
            if (this._gameWidth === undefined || this._gameHeight === undefined) {
                this._canvas.width = window.innerWidth;
                this._canvas.height = window.innerHeight;
                gl.viewport(0, 0, window.innerWidth, window.innerHeight);
                this._projection = Matrix4x4.orthographic(0, window.innerWidth, window.innerHeight, 0, -100.0, 100.0);
            } else {
                let newWidth = window.innerWidth;
                let newHeight = window.innerHeight;
                let newWidthToHeight = newWidth / newHeight;
                // TODO: Game area should be not hardcoded here
                const gameArea = document.getElementById("gameArea");

                if (newWidthToHeight > this._aspect) {
                    newWidth = newHeight * this._aspect;
                } else {
                    newHeight = newWidth * this._aspect;
                }

                gameArea.style.width = newWidth + 'px';
                gameArea.style.height = newHeight + 'px';
                gameArea.style.marginTop = (-newHeight / 2) + 'px';
                gameArea.style.marginLeft = (-newWidth / 2) + 'px';

                this._canvas.width = newWidth;
                this._canvas.height = newHeight;
                gl.viewport(0, 0, newWidth, newHeight);
                this._projection = Matrix4x4.orthographic(0, this._gameWidth, this._gameHeight, 0, -100.0, 100.0);

                const resolutionScale = new Vector2(newWidth / this._gameWidth, newHeight / this._gameHeight);
                InputManager.setResolutionScale(resolutionScale);
            }
        }
    }

    public onMessage(message: Message): void {
        // if (message.code === 'MOUSE_UP') {
        //     const context = message.context as MouseContext;
        //     document.title = `Pos: [${context.position.x}], [${context.position.y}]`;
        // }
    }

    protected abstract getGameBehaviorBuilders(): IBehaviorBuilder[];
    protected abstract getGameBitmapFonts(): IBitmapFontAsset[];
    protected abstract getGameMaterials(): Material[];
    protected abstract getGameSounds(): ISoundAsset[];

    private registerComponents() {
        ComponentManager.registerBuilder(new SpriteComponentBuilder());
        ComponentManager.registerBuilder(new AnimatedSpriteComponentBuilder());
        ComponentManager.registerBuilder(new CollisionComponentBuilder());
        ComponentManager.registerBuilder(new BitmapTextComponentBuilder());
    }

    private registerBuilders() {
        ComponentManager.registerBuilder(new SpriteComponentBuilder());
        ComponentManager.registerBuilder(new AnimatedSpriteComponentBuilder());
        ComponentManager.registerBuilder(new CollisionComponentBuilder());
        ComponentManager.registerBuilder(new BitmapTextComponentBuilder());
    }

    private registerBehaviors() {

        BehaviorManager.registerBuilder(new RotationBehaviorBuilder());
        BehaviorManager.registerBuilder(new KeyboardMovementBehaviorBuilder());

        // This is a very specific scroll, might need a better name
        BehaviorManager.registerBuilder(new ScrollBehaviorBuilder());
        BehaviorManager.registerBuilder(new MouseClickBehaviorBuilder());
        BehaviorManager.registerBuilder(new VisibilityOnMessageBehaviorBuilder());

        const gameBehaviorBuilders: IBehaviorBuilder[] = this.getGameBehaviorBuilders() || [];
        gameBehaviorBuilders.forEach(behaviorBuilder => BehaviorManager.registerBuilder(behaviorBuilder));
    }

    private registerFonts() {
        const gameBitmapFonts: IBitmapFontAsset[] = this.getGameBitmapFonts() || [];
        gameBitmapFonts.forEach(font => BitmapFontManager.addFont(font.name, font.src));
        BitmapFontManager.load();
    }

    private registerMaterials() {
        const gameMaterials: Material[] = this.getGameMaterials() || [];
        gameMaterials.forEach(material => MaterialManager.registerMaterial(material));
    }

    private registersounds() {
        const gameSounds: ISoundAsset[] = this.getGameSounds() || [];
        gameSounds.forEach(sound => AudioManager.loadSoundFile(sound.name, sound.src, sound.loop));
    }

    private loop(): void {
        if (this._isFirstUpdate) {

        }

        this.update();
        this.render();

        requestAnimationFrame(this.loop.bind(this));
    }

    private preloading() {
        // Make sure we always update message bus
        MessageBus.update(0);

        if (!BitmapFontManager.updateReady()) {
            requestAnimationFrame(this.preloading.bind(this));
            return;
        }

        // Load up Zone. Make this configurable
        ZoneManager.changeZone(0);

        this.loop();
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
        gl.uniformMatrix4fv(projectionPosition, false, this._projection.toFloat32Array());
    }

    private createProjection(): mat4 {
        let m: mat4 = mat4.create();

        return mat4.ortho(m, 0, this._canvas.width, this._canvas.height, 0, -100.0, 100.0);
    }
}

