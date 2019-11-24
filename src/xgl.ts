
import { GLUtilities, gl } from './gl/gl';
import { Shader } from './gl/shader';
import { Sprite } from './graphics/sprite';
import { Matrix4x4 } from './math/matrix4x4';
import { AssetManager } from './assets/assetManager';
import { MessageBus } from './message/messageBus';

export class XGLEngine {

    private _canvas: HTMLCanvasElement;
    private _gl: GLUtilities;
    private _shader: Shader;

    private _sprite: Sprite;

    private _projection: Matrix4x4;

    public constructor() { }

    public start(): void {

        this._gl = new GLUtilities();
        this._canvas = this._gl.init();

        AssetManager.initialize();

        this.resize();

        this.loadShaders();
        this._shader.use();

        this._projection = Matrix4x4.orthographic(0, this._canvas.width, 0, this._canvas.height, -100.0, 100.0);

        // this.createBuffer();
        this._sprite = new Sprite('test', 'assets/textures/test.jpg');
        this._sprite.position.x = 200;
        this._sprite.position.y = 200;
        this._sprite.load();

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
            // gl.viewport(-1, 1, -1, 1);
            gl.viewport(0, 0, this._canvas.width, this._canvas.height);
        }
    }

    private loop(): void {

        MessageBus.update(0);

        this._gl.clearFrame();

        const colorPosition = this._shader.getUniformLocation('u_tint');
        // Orange tint
        // gl.uniform4f(colorPosition, 1.0, 0.5, 0.0, 1.0);
        // Blue tint
        // gl.uniform4f(colorPosition, 0.0, 0.3, 1.0, 1.0);
        // White tint
        gl.uniform4f(colorPosition, 1.0, 1.0, 1.0, 1.0);

        const projectionPosition = this._shader.getUniformLocation('u_projection');
        gl.uniformMatrix4fv(projectionPosition, false, new Float32Array(this._projection.data));

        const modelLocation = this._shader.getUniformLocation('u_model');
        gl.uniformMatrix4fv(modelLocation, false, new Float32Array(Matrix4x4.translation(this._sprite.position).data));

        this._sprite.draw(this._shader);

        requestAnimationFrame(this.loop.bind(this));
    }

    private loadShaders(): void {
        // Fragment shader does not have access to attributes, thats why we use v_textCoord to
        // copy a_texCoord over the Fragment Shader from the Vertex Shader
        const vertextShaderSource = `
            attribute vec3 a_position;
            attribute vec2 a_texCoord;
            
            uniform mat4 u_projection;
            uniform mat4 u_model;

            varying vec2 v_textCoord;

            void main() {
                gl_Position = u_projection * u_model * vec4(a_position, 1.0);
                v_textCoord = a_texCoord;
            }
        `;

        // sampler to retrieve color out of the texture
        const fragmentShaderSource = `
            precision mediump float;

            uniform vec4 u_tint;
            uniform sampler2D u_diffuse;

            varying vec2 v_textCoord;

            void main () {
                gl_FragColor = u_tint * texture2D(u_diffuse, v_textCoord);
            }
        `;

        this._shader = new Shader('basic', vertextShaderSource, fragmentShaderSource);
    }
}