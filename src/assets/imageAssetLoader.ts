import { IAssetLoader } from "./IAssetLoader";
import { IAsset } from './IAsset';
import { AssetManager } from "./assetManager";

export class ImageAsset implements IAsset {
    public readonly name: string;
    public readonly data: HTMLImageElement;

    public constructor(name: string, data: HTMLImageElement) {
        this.name = name;
        this.data = data;
    }

    get width(): number {
        return this.data.width;
    }

    get height(): number {
        return this.data.height;
    }
}

export class ImageAssetLoader implements IAssetLoader {

    public get supportedExtensions(): string[] {
        return ['png', 'gif', 'jpg'];
    }

    public loadAsset(assetName: string): void {
        const image: HTMLImageElement = new Image();

        image.onload = this.onImageLoaded.bind(this, assetName, image);

        image.src = assetName;
    }

    private onImageLoaded(assetName: string, image: HTMLImageElement): void {
        console.log('OnImageLoaded: assetName/Image', assetName, image);

        const asset = new ImageAsset(assetName, image);
        AssetManager.onAssetLoaded(asset);

    }

}