

export let gl: WebGLRenderingContext;

export class GLUtilities {

    public init (elId?: string): HTMLCanvasElement {
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
        if (gl === undefined) {
            throw new Error('Unable to get the rendering context.')
        }

        gl.clearColor(0, 0, 0, 1);

        return canvas;
    }

    public clearFrame(): void {
        gl.clear(gl.COLOR_BUFFER_BIT);
    }
}