import { gl } from './gl';

export class Shader {
    private _name: string;
    private _program: WebGLProgram;

    public constructor (name:string, vertexSource: string, fragmentSource: string) {
        this._name = name;

        const vertexShader = this.loadShader(vertexSource, gl.VERTEX_SHADER);
        const fragmentShader = this.loadShader(fragmentSource, gl.FRAGMENT_SHADER);

        this.createProgram(vertexShader, fragmentShader);
    }

    /**
     * Use the shaders
     */
    public use():void {
        gl.useProgram(this._program);
    }

    private loadShader(source: string, shaderType: number):WebGLShader {
        const shader = gl.createShader(shaderType) as WebGLShader;

        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        const error = gl.getShaderInfoLog(shader);
        if (error !== '') {
            throw new Error(`Error compiling shader: ${this._name} with error: ${error}`);
        }

        return shader;
    }

    private createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): void {
        this._program = gl.createProgram() as WebGLProgram;

        gl.attachShader(this._program, vertexShader);
        gl.attachShader(this._program, fragmentShader);

        gl.linkProgram(this._program);

        const error = gl.getProgramInfoLog(this._program);
        if (error !== '') {
            throw new Error(`Error creating the WebGL program: ${this._program} with error: ${error}`);
        }

    }
}