import { gl } from '../gl/gl';
import { AttributeInfo, GLBuffer } from '../gl/glBuffer';
import { Shader } from '../gl/shader';
import { MaterialManager } from './materialManager';
import { Matrix4x4 } from '../math/matrix4x4';
import { Material } from './material';
import { Vertex } from './vertex';
import { Vector3 } from '../math/vector3';

export class Sprite {

    protected _name: string;
    protected _width: number;
    protected _height: number;
    protected _buffer: GLBuffer;
    protected _materialName: string;
    protected _material: Material;
    protected _origin: Vector3 = Vector3.zero;

    protected _vertices: Vertex[] = [];

    public constructor(name: string, materialName: string, width: number = 100, height: number = 100) {
        this._name = name;
        this._width = width;
        this._height = height;
        this._materialName = materialName;

        this._material = MaterialManager.getMaterial(this._materialName);
    }

    public get name(): string {
        return this._name;
    }

    public get origin(): Vector3 {
        return this._origin;
    }

    public set origin(value: Vector3) {
        this._origin = value;

        // TODO: This should be better dynamically calculated at the shader
        this.recalculateVertices()
    }

    public get width(): number {
        return this._width;
    }

    public get height(): number {
        return this._height;
    }

    public destroy(): void {
        this._buffer.destroy();
        MaterialManager.releaseMaterial(this._materialName);
        this._material = undefined!;
        this._materialName = undefined!;
    }

    public load(): void {
        this._buffer = new GLBuffer();
        let positionAttribute = new AttributeInfo();

        // positionAttribute.location = this._shader.getAttributeLocation('a_position');
        // Standard set of attributes for now. Position attribute to be the first attribute in the shader.
        positionAttribute.location = 0;
        positionAttribute.size = 3;
        this._buffer.addAttributeLocation(positionAttribute);

        const textCoordAttribute = new AttributeInfo();
        textCoordAttribute.location = 1;
        textCoordAttribute.size = 2;
        this._buffer.addAttributeLocation(textCoordAttribute);

        this.calculateVertices();
    }

    public update(time: number): void {

    }

    public draw(shader: Shader, model: Matrix4x4): void {

        const modelLocation = shader.getUniformLocation('u_model');
        gl.uniformMatrix4fv(modelLocation, false, model.toFloat32Array());

        const colorLocation = shader.getUniformLocation('u_tint');
        // Orange tint
        // gl.uniform4f(colorLocation, 1.0, 0.5, 0.0, 1.0);
        // Blue tint
        // gl.uniform4f(colorLocation, 0.0, 0.3, 1.0, 1.0);
        // White tint
        gl.uniform4fv(colorLocation, this._material.tint.toFloat32Array());

        // What texture unit to unescape, 0 for now
        if (this._material.diffuseTexture !== undefined) {
            this._material.diffuseTexture.activateAndBind(0);
            const diffuseLocation = shader.getUniformLocation('u_diffuse');
            gl.uniform1i(diffuseLocation, 0);
        }

        this._buffer.bind();
        this._buffer.draw();
    }

    protected calculateVertices() {

        const minX = -(this._width * this._origin.x);
        const maxX = this._width * (1.0 - this._origin.x);

        const minY = -(this._height * this._origin.y);
        const maxY = this._height * (1.0 - this._origin.y);

        this._vertices = [
            // x, y, z      u,v
            new Vertex(minX, minY, 0, 0, 0),
            new Vertex(minX, maxY, 0, 0, 1.0),
            new Vertex(maxX, maxY, 0, 1.0, 1.0),

            new Vertex(maxX, maxY, 0, 1.0, 1.0),
            new Vertex(maxX, minY, 0, 1.0, 0),
            new Vertex(minX, minY, 0, 0, 0)
        ];

        for (let v of this._vertices) {
            this._buffer.pushBackData(v.toArray());
        }

        this._buffer.upload();
        this._buffer.unbind();
    }

    protected recalculateVertices() {

        const minX = -(this._width * this._origin.x);
        const maxX = this._width * (1.0 - this._origin.x);

        const minY = -(this._height * this._origin.y);
        const maxY = this._height * (1.0 - this._origin.y);

        this._vertices[0].position.set(minX, minY);
        this._vertices[1].position.set(minX, maxY);
        this._vertices[2].position.set(maxX, maxY);

        this._vertices[3].position.set(maxX, maxY);
        this._vertices[4].position.set(maxX, minY);
        this._vertices[5].position.set(minX, minY);

        this._buffer.clearData();
        for (let v of this._vertices) {
            this._buffer.pushBackData(v.toArray());
        }

        this._buffer.upload();
        this._buffer.unbind();
    }
}