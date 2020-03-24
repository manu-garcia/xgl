import { Vector2 } from "../../math/vector2";

export interface IShape2D {
    position: Vector2;
    origin: Vector2;

    readonly offset: Vector2;

    setFromJson(json: any): void;
    intersects(shape: IShape2D): boolean;
    pointInShape(potin: Vector2): boolean;
}