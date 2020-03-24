import { gl } from './gl';

/**
 * Shaders are the programs that run in the GPU (Written in Open GL ES Shader language, ES SL)
 */
export abstract class Shader {
    private _name: string;
    private _program: WebGLProgram;
    private _attributes: { [name: string]: number } = {};
    private _uniforms: { [name: string]: WebGLUniformLocation } = {};

    public constructor(name: string) {
        this._name = name;
    }

    /**
     * Use the shaders
     */
    public use(): void {
        gl.useProgram(this._program);
    }

    /**
     * Gets the location of an attribute
     * 
     * @param name The name of the attribute to get the location for
     */
    public getAttributeLocation(name: string): number {
        if (this._attributes[name] === undefined) {
            throw new Error(`Unable to find attribute ${name} in shader ${this._name}`);
        }

        return this._attributes[name];
    }

    /**
     * Gets the location of a uniform
     * 
     * @param name The name of the uniform to get the location for
     */
    public getUniformLocation(name: string): WebGLUniformLocation {
        if (this._uniforms[name] === undefined) {
            throw new Error(`Unable to find uniform ${name} in shader ${this._name}`);
        }

        return this._uniforms[name];
    }

    /**
     * 
     * @param vertexSource 
     * @param fragmentSource 
     */
    protected load(vertexSource: string, fragmentSource: string): void {

        const vertexShader = this.loadShader(vertexSource, gl.VERTEX_SHADER);
        const fragmentShader = this.loadShader(fragmentSource, gl.FRAGMENT_SHADER);

        this.createProgram(vertexShader, fragmentShader);
        this.detectAttributes();
        this.detectUniforms();

    }

    private loadShader(source: string, shaderType: number): WebGLShader {
        const shader = gl.createShader(shaderType) as WebGLShader;

        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        const error = gl.getShaderInfoLog(shader)?.trim();
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

        const error = gl.getProgramInfoLog(this._program)?.trim();
        if (error !== '') {
            throw new Error(`Error creating the WebGL program: ${this._program} with error: ${error}`);
        }

    }

    /**
     * Extract attributes from shader source so that we can reference them.
     */
    private detectAttributes(): void {
        const attributeCount = gl.getProgramParameter(this._program, gl.ACTIVE_ATTRIBUTES);

        for (let i = 0; i < attributeCount; i++) {
            const info: WebGLActiveInfo = gl.getActiveAttrib(this._program, i) as WebGLActiveInfo;

            if (!info) {
                break;
            }

            this._attributes[info.name] = gl.getAttribLocation(this._program, info.name);
        }
    }

    /**
     * Extract uniforms from shader source so that we can reference them.
     */
    private detectUniforms(): void {
        const uniformCount = gl.getProgramParameter(this._program, gl.ACTIVE_UNIFORMS);

        for (let i = 0; i < uniformCount; i++) {
            const info: WebGLActiveInfo = gl.getActiveUniform(this._program, i) as WebGLActiveInfo;

            if (!info) {
                break;
            }

            this._uniforms[info.name] = gl.getUniformLocation(this._program, info.name) as WebGLUniformLocation;
        }
    }

}