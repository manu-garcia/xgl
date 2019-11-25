import { Zone } from "./zone";
import { TestZone } from "./testZone";
import { Shader } from '../gl/shader';

export class ZoneManager {

    private static _globalZoneID: number = -1;
    private static _zones: { [id: number]: Zone } = {};
    private static _activeZone: Zone;

    private constructor() {

    }

    public static createZone(name: string, description: string): number {

        ZoneManager._globalZoneID++;

        const zone = new Zone(ZoneManager._globalZoneID, name, description);
        ZoneManager._zones[ZoneManager._globalZoneID] = zone;

        return ZoneManager._globalZoneID;
    }

    // TODO: Remove this as it is for testing only purposes
    public static createTestZone(): number {

        ZoneManager._globalZoneID++;

        const zone = new TestZone(ZoneManager._globalZoneID, 'test', 'test zone');
        ZoneManager._zones[ZoneManager._globalZoneID] = zone;

        return ZoneManager._globalZoneID;
    }

    public static changeZone(id: number): void {
        if (this._activeZone !== undefined) {
            ZoneManager._activeZone.onDeactivated();
            ZoneManager._activeZone.unload();
        }

        if (ZoneManager._zones[id] !== undefined) {
            ZoneManager._activeZone = ZoneManager._zones[id];
            ZoneManager._activeZone.onActivated();
            ZoneManager._activeZone.load();
        }
    }

    public static update(time: number): void {
        if (ZoneManager._activeZone !== undefined) {
            ZoneManager._activeZone.update(time);
        }
    }

    public static render(shader: Shader): void {
        if (ZoneManager._activeZone !== undefined) {
            ZoneManager._activeZone.render(shader);
        }
    }
}