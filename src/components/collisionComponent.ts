import { Shader } from '../gl/shader';
import { BaseComponent } from "./baseComponent";
import { IComponent } from "./IComponent";
import { IComponentData } from './IComponentData';
import { IComponentBuilder } from './IComponentBuilder';
import { IShape2D } from '../graphics/shapes2D/IShape2D';
import { Rectangle2D } from '../graphics/shapes2D/rectangle2D';
import { Circle2D } from '../graphics/shapes2D/circle2D';
import { CollisionManager } from '../collision/CollisionManager';

export class CollisionComponentData implements IComponentData {
    public name: string;
    public shape: IShape2D;
    public static: boolean = true;

    public setFromJson(json: any): void {
        if (json.name !== undefined) {
            this.name = String(json.name);
        }

        if (json.static !== undefined) {
            this.static = Boolean(json.static);
        }

        if (json.shape === undefined) {
            throw new Error('CollisionComponentData requires shape to be present.');
        }

        if (json.shape.type === undefined) {
            throw new Error('CollisionComponentData requires shape.type to be present.');
        }

        const shapeType = String(json.shape.type).toLowerCase();

        switch (shapeType) {
            case 'rectangle':
                this.shape = new Rectangle2D();
                break;

            case 'circle':
                this.shape = new Circle2D();
                break;

            default:
                throw new Error('Unssuported shape type ' + shapeType);
                break;
        }

        this.shape.setFromJson(json.shape);
    }
}

export class CollisionComponentBuilder implements IComponentBuilder {

    public get type(): string {
        return 'collision';
    }

    public buildFromJson(json: any): IComponent {
        const data = new CollisionComponentData();
        data.setFromJson(json);
        return new CollisionComponent(data);
    }

}

export class CollisionComponent extends BaseComponent {

    private _shape: IShape2D;
    private _static: boolean;

    public constructor(data: CollisionComponentData) {
        super(data);

        this._shape = data.shape;
        this._static = data.static;
    }

    public get shape(): IShape2D {
        return this._shape;
    }

    public get isStatic(): boolean {
        return this._static;
    }

    public load() {
        super.load();

        // TODO: Update this to handle nested objects. Get world position
        this._shape.position.copyFrom(this._owner.getWorldPosition().toVector2().subtract(this._shape.offset));

        // Tell the collision manager we exists
        CollisionManager.registerCollisionComponent(this);
    }

    public update(time: number) {
        // TODO: Update this to handle nested objects. Get world position
        this._shape.position.copyFrom(this._owner.getWorldPosition().toVector2().subtract(this._shape.offset));

        super.update(time);
    }

    public render(shader: Shader): void {
        // this._shape.draw(shader, this.owner.worldMatrix); 
        super.render(shader);
    }

    public onCollisionEntry(other: CollisionComponent) {
        console.log('onCollisionEntry ', this, other);
    }

    public onCollisionUpdate(other: CollisionComponent) {
        // console.log('onCollisionUpdate ', this, other);
    }

    public onCollisionExit(other: CollisionComponent) {
        console.log('onCollisionExit ', this, other);
    }
}