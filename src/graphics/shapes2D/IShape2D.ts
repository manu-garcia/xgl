import { Vector2 } from "../../math/vector2";
import { Shader } from "../../gl/shader";
import { Matrix4x4 } from "../../math/matrix4x4";

export interface IShape2D {
    position: Vector2;
    origin: Vector2;

    readonly offset: Vector2;

    setFromJson(json: any): void;
    intersects(shape: IShape2D): boolean;
    pointInShape(point: Vector2): boolean;
    load(): void;
    draw(shader: Shader, model: Matrix4x4): void;
}