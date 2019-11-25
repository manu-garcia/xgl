import { SimObject } from "../world/simObject";
import { Shader } from '../gl/shader';

export interface IComponent {
    name: string;

    readonly owner: SimObject;
    setOwner(owner: SimObject): void;

    load(): void;
    update(time: number): void;
    render(shader: Shader): void;
}