
export let gl: WebGLRenderingContext;

export class GLUtilities {

    public static init(elId?: string): HTMLCanvasElement {
        let canvas: HTMLCanvasElement;

        if (elId !== undefined) {
            canvas = document.getElementById(elId) as HTMLCanvasElement;
            if (canvas === undefined) {
                throw new Error(`Unable to find DOM element with ID: ${elId}`);
            }
        } else {
            canvas = document.createElement('canvas') as HTMLCanvasElement;
            document.body.appendChild(canvas);
        }

        gl = canvas.getContext('webgl') as WebGLRenderingContext;
        if (gl === undefined || gl === null) {
            gl = canvas.getContext('experimental-webgl') as WebGLRenderingContext;
            if (gl === undefined || gl === null) {
                throw new Error('Unable to get the rendering context.')
            }
        }

        gl.clearColor(0, 0, 0.5, 1);

        // Allows transparency in sprites
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        return canvas;
    }

    public static clearFrame(): void {
        gl.clear(gl.COLOR_BUFFER_BIT);
    }
}