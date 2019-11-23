
import { GLUtilities, gl} from './gl/gl';
import { Shader } from './gl/shader';
import { GLBuffer, AttributeInfo } from './gl/glbuffer';

export class XGLEngine {

    private _canvas: HTMLCanvasElement;
    private _gl: GLUtilities;
    private _shader: Shader;

    private _buffer: GLBuffer;

    public constructor () {}

    public start(): void {

        this._gl = new GLUtilities();
        this._canvas = this._gl.init();

        this.resize();

        this.loadShaders();
        this._shader.use();

        this.createBuffer();

        this.loop();
    }

    /**
     * Resizes to fit the window.
     */
    public resize (): void {
        if (this._canvas !== undefined) {
            this._canvas.width = window.innerWidth;
            this._canvas.height = window.innerHeight;

            gl.viewport(0, 0, this._canvas.width, this._canvas.height);
        }
    }

    private loop(): void {

        this._gl.clearFrame();

        const colorPosition = this._shader.getUniformLocation('u_color');
        gl.uniform4f(colorPosition, 1.0, 0.5, 0.0, 1.0);

        this._buffer.bind();
        this._buffer.draw();

        requestAnimationFrame(this.loop.bind(this));
    }

    private createBuffer():void {
        this._buffer = new GLBuffer(3);
        let positionAttribute = new AttributeInfo();
        positionAttribute.location = this._shader.getAttributeLocation('a_position');
        positionAttribute.offset = 0;
        positionAttribute.size = 3;
        this._buffer.addAttributeLocation(positionAttribute);

        const vertices = [
            // x, y, z
            0, 0, 0,
            0, 0.5, 0,
            0.5, 0.5, 0
        ];

        this._buffer.pushBackData(vertices);
        this._buffer.upload();
        this._buffer.bind();
    }

    private loadShaders():void {
        let vertextShaderSource = `
            attribute vec3 a_position;

            void main() {
                gl_Position = vec4(a_position, 1.0);
            }
        `;

        let fragmentShaderSource = `
            precision mediump float;
            uniform vec4 u_color;

            void main () {
                gl_FragColor = u_color;
            }
        `;

        this._shader = new Shader('basic', vertextShaderSource, fragmentShaderSource);
    }
}