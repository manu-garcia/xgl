import { Shader } from '../gl/shader';
import { AnimatedSprite } from "../graphics/animatedSprite";
import { BaseComponent } from "./baseComponent";
import { IComponent } from "./IComponent";
import { IComponentData } from './IComponentData';
import { IComponentBuilder } from './IComponentBuilder';
import { SpriteComponentData } from './spriteComponent';

export class AnimatedSpriteComponentData extends SpriteComponentData implements IComponentData {

    public frameWidth: number;
    public frameHeight: number;
    public frameCount: number;
    public frameSequence: number[] = [];

    public setFromJson(json: any): void {
        super.setFromJson(json);

        if (json.frameWidth === undefined) {
            throw new Error("AnimatedComponentData requires 'frameWidth' to be defined");
        } else {
            this.frameWidth = Number(json.frameWidth);
        }

        if (json.frameHeight === undefined) {
            throw new Error("AnimatedComponentData requires 'frameHeight' to be defined");
        } else {
            this.frameHeight = Number(json.frameHeight);
        }

        if (json.frameCount === undefined) {
            throw new Error("AnimatedComponentData requires 'frameCount' to be defined");
        } else {
            this.frameCount = Number(json.frameCount);
        }

        if (json.frameSequence === undefined) {
            throw new Error("AnimatedComponentData requires 'frameSequence' to be defined");
        } else {
            this.frameSequence = json.frameSequence;
        }
    }
}

export class AnimatedSpriteComponentBuilder implements IComponentBuilder {

    public get type(): string {
        return 'animatedSprite';
    }

    public buildFromJson(json: any): IComponent {
        const data = new AnimatedSpriteComponentData();
        data.setFromJson(json);
        return new AnimatedSpriteComponent(data);
    }

}

export class AnimatedSpriteComponent extends BaseComponent {

    private _sprite: AnimatedSprite;

    public constructor(data: AnimatedSpriteComponentData) {
        super(data);

        this._sprite = new AnimatedSprite(data.name, data.materialName, data.frameWidth, data.frameHeight, data.frameWidth, data.frameHeight, data.frameCount, data.frameSequence);
    }

    public load(): void {
        this._sprite.load();
    }

    public update(time: number): void {

        this._sprite.update(time);

        super.update(time);
    }

    public render(shader: Shader): void {
        this._sprite.draw(shader, this.owner.worldMatrix);
        super.render(shader);
    }
}