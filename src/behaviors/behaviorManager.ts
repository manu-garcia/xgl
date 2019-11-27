import { IBehaviorBuilder } from './IBehaviorBuilder';
import { IBehavior } from './IBehavior';

export class BehaviorManager {

    private static _registeredBuilders: { [type: string]: IBehaviorBuilder } = {};

    public static registeredBuilder(builder: IBehaviorBuilder): void {
        BehaviorManager._registeredBuilders[builder.type] = builder;
    }

    public static extractBehavior(json: any): IBehavior {

        let behavior: IBehavior | undefined = undefined;

        if (json.type !== undefined) {
            if (BehaviorManager._registeredBuilders[String(json.type)] !== undefined) {
                behavior = BehaviorManager._registeredBuilders[String(json.type)].buildFromJson(json);
            }
        }

        if (behavior === undefined) {
            throw new Error("Behavior manager error - type is missing or builder is not registered for this type.");
        }

        return behavior;

    }

}