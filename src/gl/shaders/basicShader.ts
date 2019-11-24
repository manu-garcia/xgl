import { Shader } from '../shader';

export class BasicShader extends Shader {

    public constructor() {
        super('basic');
        this.load(this.getVertexSource(), this.getFragmentSource());
    }

    private getVertexSource(): string {

        // Fragment shader does not have access to attributes, thats why we use v_textCoord to
        // copy a_texCoord over the Fragment Shader from the Vertex Shader
        return `
            attribute vec3 a_position;
            attribute vec2 a_texCoord;
            
            uniform mat4 u_projection;
            uniform mat4 u_model;

            varying vec2 v_textCoord;

            void main() {
                gl_Position = u_projection * u_model * vec4(a_position, 1.0);
                v_textCoord = a_texCoord;
            }
        `;
    }

    private getFragmentSource(): string {
        // sampler to retrieve color out of the texture
        return `
            precision mediump float;

            uniform vec4 u_tint;
            uniform sampler2D u_diffuse;

            varying vec2 v_textCoord;

            void main () {
                gl_FragColor = u_tint * texture2D(u_diffuse, v_textCoord);
            }
        `;
    }
}