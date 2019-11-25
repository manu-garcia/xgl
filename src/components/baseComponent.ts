import { SimObject } from '../world/simObject';
import { Shader } from '../gl/shader';
import { IComponentBuilder } from './IComponentBuilder';
import { IComponentData } from './IComponentData';

export abstract class BaseComponent implements IComponentBuilder {
    type: string;
    buildFromJson(json: any): import("./IComponent").IComponent {
        throw new Error("Method not implemented.");
    }
    protected _owner: SimObject;
    protected _data: IComponentData;

    public name: string;

    public constructor(data: IComponentData) {
        this._data = data;
        this.name = data.name;
    }

    public get owner(): SimObject {
        return this._owner;
    }

    public setOwner(owner: SimObject): void {
        this._owner = owner;
    }

    public load(): void {

    }
    public update(time: number): void {

    }

    public render(shader: Shader): void {

    }
}