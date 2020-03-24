import { Vector2 } from '../math/vector2';
import { Sprite } from './sprite';
import { IMessageHandler } from '../message/IMessageHandler';
import { Message } from '../message/message';
import { MESSAGE_ASSET_LOADER_ASSET_LOADED, AssetManager } from '../assets/assetManager';
import { ImageAsset } from '../assets/imageAssetLoader';
import { MaterialManager } from './materialManager';

class UVInfo {
    public min: Vector2;
    public max: Vector2;
    public constructor(min: Vector2, max: Vector2) {
        this.min = min;
        this.max = max;
    }
}

export class AnimatedSprite extends Sprite implements IMessageHandler {

    private _frameWidth: number;
    private _frameHeight: number;
    private _frameCount: number;
    private _frameSequence: number[];

    // TODO: Make this configurable
    private _frameTime: number = 150;
    private _frameUVs: UVInfo[] = [];

    private _currentFrame: number = 0;
    protected _currentTime: number = 0;
    private _assetLoaded: boolean = false;
    private _assetWidth: number = 2;
    private _assetHeight: number = 2;

    public constructor(name: string, materialName: string, width: number = 100, height: number = 100, frameWidth: number = 10, frameHeight: number = 10, frameCount: number = 1, frameSequence: number[] = []) {
        super(name, materialName, width, height);

        this._frameWidth = frameWidth;
        this._frameHeight = frameHeight;
        this._frameCount = frameCount;
        this._frameSequence = frameSequence;

        Message.subscribe(MESSAGE_ASSET_LOADER_ASSET_LOADED + this._material.diffuseTextureName, this);

    }

    public destroy(): void {
        super.destroy();
    }

    /**
     * Calculates UV coordinates once the texture is loaded
     * 
     * @param message 
     */
    public onMessage(message: Message): void {
        if (message.code === MESSAGE_ASSET_LOADER_ASSET_LOADED + this._material.diffuseTextureName) {

            this._assetLoaded = true;

            const asset = message.context as ImageAsset;
            this._assetWidth = asset.width;
            this._assetHeight = asset.height;

            this._calculateUVs();
        }
    }

    public load(): void {
        super.load();

        if (!this._assetLoaded) {
            this.setupFromMaterial();
        }
    }

    public update(time: number): void {

        if (!this._assetLoaded) {
            this.setupFromMaterial();
            return;
        }

        this._currentTime += time;

        if (this._currentTime > this._frameTime) {
            this._currentFrame++;
            this._currentTime = 0;

            if (this._currentFrame >= this._frameSequence.length) {
                this._currentFrame = 0;
            }

            // Gets current frame U and V coordinates within the tiled texture containing all sprite frames
            // Example data as reference
            // this._vertices = [
            //     // x, y, z      u,v
            //     new Vertex(0, 0, 0, 0, 0),
            //     new Vertex(0, this._height, 0, 0, 1.0),
            //     new Vertex(this._width, this._height, 0, 1.0, 1.0),

            //     new Vertex(this._width, this._height, 0, 1.0, 1.0),
            //     new Vertex(this._width, 0, 0, 1.0, 0),
            //     new Vertex(0, 0, 0, 0, 0)
            // ];
            const frameUVs = this._frameSequence[this._currentFrame];
            this._vertices[0].textCoords.copyFrom(this._frameUVs[frameUVs].min);
            this._vertices[1].textCoords = new Vector2(this._frameUVs[frameUVs].min.x, this._frameUVs[frameUVs].max.y);

            this._vertices[2].textCoords.copyFrom(this._frameUVs[frameUVs].max);
            this._vertices[3].textCoords.copyFrom(this._frameUVs[frameUVs].max);

            this._vertices[4].textCoords = new Vector2(this._frameUVs[frameUVs].max.x, this._frameUVs[frameUVs].min.y);
            this._vertices[5].textCoords.copyFrom(this._frameUVs[frameUVs].min);

            this._buffer.clearData();
            for (let v of this._vertices) {
                this._buffer.pushBackData(v.toArray());
            }

            this._buffer.upload();
            this._buffer.bind();

        }

        super.update(time);
    }

    private _calculateUVs(): void {

        let totalWidth: number = 0;
        let yValue: number = 0;

        for (let i = 0; i < this._frameCount; ++i) {
            totalWidth = i * this._frameWidth;

            if (totalWidth > this._assetWidth) {
                yValue++;
                totalWidth = 0;
            }

            let uMin = (i * this._frameWidth) / this._assetWidth;
            let vMin = (yValue * this._frameHeight) / this._assetHeight;
            let min: Vector2 = new Vector2(uMin, vMin);

            let uMax = ((i * this._frameWidth) + this._frameWidth) / this._assetWidth;
            let vMax = ((yValue * this._frameHeight) + this._frameHeight) / this._assetHeight;
            let max: Vector2 = new Vector2(uMax, vMax);

            this._frameUVs.push(new UVInfo(min, max));

        }
    }

    // Fixes race condition where texture has been cached
    private setupFromMaterial() {
        if (!this._assetLoaded) {
            const material = MaterialManager.getMaterial(this._materialName);
            if (material.diffuseTexture.isLoaded) {
                if (AssetManager.isAssetLoaded(material.diffuseTextureName)) {
                    this._assetWidth = material.diffuseTexture.width;
                    this._assetHeight = material.diffuseTexture.height;
                    this._assetLoaded = true;
                    this._calculateUVs();
                }
            }
        }
    }
}