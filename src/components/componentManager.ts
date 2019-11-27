import { IComponentBuilder } from './IComponentBuilder';
import { IComponent } from './IComponent';

export class ComponentManager {

    private static _registeredBuilders: { [type: string]: IComponentBuilder } = {};

    public static registeredBuilder(builder: IComponentBuilder): void {
        ComponentManager._registeredBuilders[builder.type] = builder;
    }

    public static extractComponent(json: any): IComponent {

        let component: IComponent | undefined = undefined;

        if (json.type !== undefined) {
            if (ComponentManager._registeredBuilders[String(json.type)] !== undefined) {
                component = ComponentManager._registeredBuilders[String(json.type)].buildFromJson(json);
            }
        }

        if (component === undefined) {
            throw new Error("Component manager error - type is missing or builder is not registered for this type.");
        }

        return component;

    }

}