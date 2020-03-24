import { CollisionComponent } from "../components/collisionComponent";

export class CollisionData {
    public a: CollisionComponent;
    public b: CollisionComponent;
    public time: number;

    public constructor(time: number, a: CollisionComponent, b: CollisionComponent) {
        this.time = time;
        this.a = a;
        this.b = b;
    }

}

export class CollisionManager {

    private static _totalTime: number = 0;
    private static _components: CollisionComponent[] = [];
    private static _collisionData: CollisionData[] = [];
    private constructor() {

    }

    public static registerCollisionComponent(component: CollisionComponent) {
        CollisionManager._components.push(component);
    }

    public static unRegisterCollisionComponent(component: CollisionComponent) {
        const index = CollisionManager._components.indexOf(component);
        if (index !== -1) {
            CollisionManager._components.slice(index, 1);
        }
    }

    public static clear() {
        CollisionManager._components.length = 0;
    }

    public static update(time: number) {

        console.log('update collision manager');
        CollisionManager._totalTime += time;

        // TODO: do this properly. Whole function!
        for (let c = 0; c < CollisionManager._components.length; ++c) {
            let comp = CollisionManager._components[c];
            for (let o = 0; o < CollisionManager._components.length; ++o) {
                let other = CollisionManager._components[o];
                // Do not check collisions with self
                if (comp === other) {
                    continue;
                }
                if (comp.shape.intersects(other.shape)) {
                    // There is a collision
                    let exists: boolean = false;
                    for (let d = 0; d < CollisionManager._collisionData.length; ++d) {
                        let data = CollisionManager._collisionData[d];

                        if ((data.a === comp && data.b === other) || (data.a === other && data.b === comp)) {
                            // We have existing data, update it
                            // onCollisionUpdate
                            comp.onCollisionUpdate(other);
                            other.onCollisionUpdate(comp);
                            data.time = CollisionManager._totalTime;
                            exists = true;
                            break;
                        }
                    }

                    if (!exists) {
                        // Create a new collision
                        // onCollisionEntry
                        let col = new CollisionData(CollisionManager._totalTime, comp, other);
                        comp.onCollisionEntry(other);
                        other.onCollisionEntry(comp);
                        this._collisionData.push(col);
                    }
                }
            }
        }

        // Collision that not longer exist
        const removeData: CollisionData[] = [];
        for (let d = 0; d < CollisionManager._collisionData.length; ++d) {
            const data = CollisionManager._collisionData[d];
            if (data.time !== CollisionManager._totalTime) {
                // onCollisionExit
                removeData.push(data);
                data.a.onCollisionExit(data.b);
                data.b.onCollisionExit(data.a);
            }
        }

        while (removeData.length !== 0) {
            const index = CollisionManager._collisionData.indexOf(removeData[0]);
            CollisionManager._collisionData.splice(index, 1);
            removeData.shift();
        }

        // TODO: remove this
        document.title = CollisionManager._collisionData.length.toString();
    }

}