import { gl } from '../gl/gl';
import { AttributeInfo, GLBuffer } from '../gl/glBuffer';
import { Shader } from '../gl/shader';
import { Vector3 } from '../math/vector3';
import { MaterialManager } from './materialManager';
import { Matrix4x4 } from '../math/matrix4x4';
import { Material } from './material';

export class Sprite {

    private _name: string;
    private _width: number;
    private _height: number;

    private _buffer: GLBuffer;
    private _materialName: string;
    private _material: Material;

    public position: Vector3 = new Vector3();

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

    public destroy(): void {
        this._buffer.destroy();
        MaterialManager.releaseMaterial(this._materialName);
        this._material = undefined!;
        this._materialName = undefined!;
    }

    public load(): void {
        this._buffer = new GLBuffer(5);
        let positionAttribute = new AttributeInfo();

        // positionAttribute.location = this._shader.getAttributeLocation('a_position');
        // Standard set of attributes for now. Position attribute to be the first attribute in the shader.
        positionAttribute.location = 0;
        positionAttribute.offset = 0;
        positionAttribute.size = 3;
        this._buffer.addAttributeLocation(positionAttribute);

        let textCoordAttribute = new AttributeInfo();
        textCoordAttribute.location = 1;
        textCoordAttribute.offset = 3;
        textCoordAttribute.size = 2;
        this._buffer.addAttributeLocation(textCoordAttribute);

        const vertices = [
            // x, y, z      u,v
            0, 0, 0, 0, 0,
            0, this._height, 0, 0, 1.0,
            this._width, this._height, 0, 1.0, 1.0,

            this._width, this._height, 0, 1.0, 1.0,
            this._width, 0, 0, 1.0, 0,
            0, 0, 0, 0, 0
        ];

        this._buffer.pushBackData(vertices);
        this._buffer.upload();
        this._buffer.bind();
    }

    public update(time: number): void {

    }

    public draw(shader: Shader): void {

        const modelLocation = shader.getUniformLocation('u_model');
        gl.uniformMatrix4fv(modelLocation, false, new Float32Array(Matrix4x4.translation(this.position).data));

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
}