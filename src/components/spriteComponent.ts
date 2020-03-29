import { Shader } from '../gl/shader';
import { Sprite } from "../graphics/sprite";
import { BaseComponent } from "./baseComponent";
import { IComponent } from "./IComponent";
import { IComponentData } from './IComponentData';
import { IComponentBuilder } from './IComponentBuilder';
import { Vector3 } from '../math/vector3';

export class SpriteComponentData implements IComponentData {
    public name: string;
    public materialName: string;
    public origin: Vector3 = Vector3.zero;
    public width: number;
    public height: number;

    public setFromJson(json: any): void {
        if (json.name !== undefined) {
            this.name = String(json.name);
        }

        if (json.width !== undefined) {
            this.width = Number(json.width);
        }

        if (json.height !== undefined) {
            this.height = Number(json.height);
        }

        if (json.materialName !== undefined) {
            this.materialName = String(json.materialName);
        }

        if (json.origin !== undefined) {
            this.origin.setFromJson(json.origin);
        }
    }
}

export class SpriteComponentBuilder implements IComponentBuilder {

    public get type(): string {
        return 'sprite';
    }

    public buildFromJson(json: any): IComponent {
        const data = new SpriteComponentData();
        data.setFromJson(json);
        return new SpriteComponent(data);
    }

}

export class SpriteComponent extends BaseComponent {

    private _sprite: Sprite;
    private width: number;
    private height: number;


    public constructor(data: SpriteComponentData) {
        super(data);

        this.width = data.width;
        this.height = data.height;
        this._sprite = new Sprite(data.name, data.materialName, this.width, this.height);
        if (!data.origin.equals(Vector3.zero)) {
            this._sprite.origin.copyFrom(data.origin);
        }
    }

    public load(): void {
        this._sprite.load();
    }

    public render(shader: Shader): void {
        this._sprite.draw(shader, this.owner.worldMatrix);
        super.render(shader);
    }
}