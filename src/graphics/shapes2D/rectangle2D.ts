import { IShape2D } from "./IShape2D";
import { Vector2 } from "../../math/vector2";
import { Circle2D } from "./circle2D";
import { Shader } from "../../gl/shader";
import { Matrix4x4 } from "../../math/matrix4x4";
import { gl } from "../../gl/gl";
import { GLBuffer, AttributeInfo } from "../../gl/glBuffer";
import { Vertex } from "../vertex";
import { Color } from "../color";
import { Material } from "../material";
import { MaterialManager } from "../materialManager";

export class Rectangle2D implements IShape2D {

    public position: Vector2 = Vector2.zero;
    public origin: Vector2 = Vector2.zero;
    public scale: Vector2 = Vector2.one;

    public width: number;
    public height: number;

    protected _buffer: GLBuffer;
    protected _vertices: Vertex[] = [];
    protected _material: Material;

    public constructor(
        x: number = 0, y: number = 0,
        width: number = 0, height: number = 0,
        scaleX: number = 1, scaleY: number = 1
    ) {
        this.position.x = x;
        this.position.y = y;
        this.width = width;
        this.height = height;
        this.scale.x = scaleX;
        this.scale.y = scaleY;

        // Uncomment this to see collision rectangles
        // this._material = MaterialManager.getMaterial('1px');
    }

    public get offset(): Vector2 {
        return new Vector2((this.width * this.origin.x), (this.height * this.origin.y));
    }

    public setFromJson(json: any) {
        if (json.position !== undefined) {
            this.position.setFromJson(json.position);
        }

        if (json.offset !== undefined) {
            this.offset.setFromJson(json.offset);
        }

        if (json.width === undefined) {
            throw new Error("Rectangle2D requires width to be present.");
        }

        this.width = Number(json.width);

        if (json.height === undefined) {
            throw new Error("Rectangle2D requires height to be present.");
        }

        this.height = Number(json.height);

        if (json.scale !== undefined) {
            this.scale.setFromJson(json.scale);
        }
    }

    // TODO: Add support to rotated shapes
    public intersects(other: IShape2D): boolean {
        if (other instanceof Rectangle2D) {
            let a = this.getExtents(this);
            let b = this.getExtents(other);

            return (a.position.x <= b.width && a.width >= b.position.x) && (a.position.y <= b.height && a.height >= b.position.y);
        }

        if (other instanceof Circle2D) {
            let deltaX = other.position.x - Math.max(this.position.x, Math.min(other.position.x, this.position.x + this.width));
            let deltaY = other.position.y - Math.max(this.position.y, Math.min(other.position.y, this.position.y + this.height));
            if ((deltaX * deltaX + deltaY * deltaY) < (other.radius * other.radius)) {
                return true;
            }
        }

        return false;
    }

    public pointInShape(point: Vector2): boolean {

        let x = this.width < 0 ? this.position.x - this.width : this.position.x;
        let y = this.height < 0 ? this.position.y - this.height : this.position.y;

        let extentX = this.width < 0 ? this.position.x : this.position.x + this.width;
        let extentY = this.height < 0 ? this.position.y : this.position.y + this.height;

        if (point.x >= x && point.x <= extentX && point.y >= y && point.y <= extentY) {
            return true;
        }

        return false;
    }

    public load(): void {
        if (!this._material) return;

        this._buffer = new GLBuffer();
        let positionAttribute = new AttributeInfo();

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

    public draw(shader: Shader, model: Matrix4x4): void {

        if (!this._material) return;

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

    // TODO: This is the same as sprite, move to a shared place
    protected calculateVertices() {

        const minX = -(this.width * this.origin.x);
        const maxX = this.width * (1.0 - this.origin.x);

        const minY = -(this.height * this.origin.y);
        const maxY = this.height * (1.0 - this.origin.y);

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

    // TODO: This is the same as sprite, move to a shared place
    protected recalculateVertices() {

        const minX = -(this.width * this.origin.x);
        const maxX = this.width * (1.0 - this.origin.x);

        const minY = -(this.height * this.origin.y);
        const maxY = this.height * (1.0 - this.origin.y);

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

    private getExtents(shape: Rectangle2D): Rectangle2D {
        let x = shape.width < 0 ? shape.position.x + shape.width : shape.position.x;
        let y = shape.height < 0 ? shape.position.y + shape.height : shape.position.y;

        let extentX = shape.width < 0 ? shape.position.x : shape.position.x + (shape.width * shape.scale.x);
        let extentY = shape.height < 0 ? shape.position.y : shape.position.y + (shape.height * shape.scale.y);

        return new Rectangle2D(x, y, extentX, extentY);
    }


}