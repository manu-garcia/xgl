import { Scene } from './scene';
import { Shader } from '../gl/shader';
import { SimObject } from './simObject';
import { ComponentManager } from '../components/componentManager';
import { BehaviorManager } from '../behaviors/behaviorManager';

export enum ZoneState {
    UNINITIALIZED,
    LOADING,
    UPDATING
}

export class Zone {
    private _name: string;
    private _description: string;
    private _id: number;
    private _scene: Scene;

    private _state: ZoneState = ZoneState.UNINITIALIZED;
    private _globalID: number = -1;

    public constructor(id: number, name: string, description: string) {
        this._id = id;
        this._name = name;
        this._description = description;
        this._scene = new Scene();
    }

    public get id(): number {
        return this._id;
    }

    public get name(): string {
        return this._name;
    }

    public get description(): string {
        return this._description;
    }

    public get scene(): Scene {
        return this._scene;
    }

    public initialize(zoneData: any): void {
        if (zoneData.objects === undefined) {
            throw new Error('Zone initialization error objects not present.');
        }

        for (const o in zoneData.objects) {
            const obj = zoneData.objects[o];

            this.loadSimObject(obj, this._scene.root);
        }
    }

    public load(): void {

        this._state = ZoneState.LOADING;

        this._scene.load();
        this._scene.root.updateReady();

        this._state = ZoneState.UPDATING;
    }

    public unload(): void {

    }

    public update(time: number): void {
        if (this._state === ZoneState.UPDATING) {
            this._scene.update(time);
        }
    }

    public render(shader: Shader): void {
        if (this._state === ZoneState.UPDATING) {
            this._scene.render(shader);
        }
    }

    public onActivated(): void {

    }

    public onDeactivated(): void {

    }

    private loadSimObject(dataSection: any, parent: SimObject): void {
        let name: string = '';
        if (dataSection.name !== undefined) {
            name = String(dataSection.name);
        }

        this._globalID++;
        const simObject = new SimObject(this._globalID, name, this._scene);

        if (dataSection.transform !== undefined) {
            simObject.transform.setFromJson(dataSection.transform);
        }

        if (dataSection.components !== undefined) {
            for (let c in dataSection.components) {
                const data = dataSection.components[c];
                const component = ComponentManager.extractComponent(data);
                simObject.addComponent(component);
            }
        }

        if (dataSection.behaviors !== undefined) {
            for (let b in dataSection.behaviors) {
                const data = dataSection.behaviors[b];
                const behavior = BehaviorManager.extractBehavior(data);
                simObject.addBehavior(behavior);
            }
        }

        if (dataSection.children !== undefined) {
            for (const i in dataSection.children) {
                const obj = dataSection.children[i];
                this.loadSimObject(obj, simObject);
            }
        }

        if (parent !== undefined) {
            parent.addChild(simObject);
        }
    }
}