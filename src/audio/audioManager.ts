export class SoundEffect {

    public assetPath: string;

    private _player: HTMLAudioElement;

    constructor(assetPath: string, loop: boolean) {
        this._player = new Audio(assetPath);
        this.loop = loop;
    }

    public get loop(): boolean {
        return this._player.loop;
    }

    public set loop(value: boolean) {
        this._player.loop = value;
    }

    public destroy() {
        this._player = undefined as unknown as HTMLAudioElement;
    }

    public play() {
        if (!this._player.paused) {
            this.stop();
        }
        this._player.play();
    }

    public pause() {
        this._player.pause();
    }

    public stop() {
        this._player.pause()
        this._player.currentTime = 0;
    }

}

export class AudioManager {

    private static _soundEffects: { [name: string]: SoundEffect } = {};

    public static loadSoundFile(name: string, assetPath: string, loop: boolean): void {
        AudioManager._soundEffects[name] = new SoundEffect(assetPath, loop);
    }

    public static playSound(name: string) {
        if (this._soundEffects[name] !== undefined) {
            this._soundEffects[name].play();
        }
    }

    public static stopSound(name: string) {
        if (this._soundEffects[name] !== undefined) {
            this._soundEffects[name].stop();
        }
    }

    public static stopAll(name: string) {
        for (let sfx in AudioManager._soundEffects) {
            this._soundEffects[sfx].stop();
        }
    }

    public static pauseSound(name: string) {
        if (this._soundEffects[name] !== undefined) {
            this._soundEffects[name].pause();
        }
    }

    public static pauseAll(name: string) {
        for (let sfx in AudioManager._soundEffects) {
            this._soundEffects[sfx].pause();
        }
    }
}