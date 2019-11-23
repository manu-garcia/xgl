import { gl } from './gl';

/**
 * Struct of data needed for GLBuffer attribute
 */
export class AttributeInfo {

    /**
     * Location of the attribute
     */
    public location: number;

    /**
     * Size of the attribute (number of elements). i.e Vector3 = 3
     */
    public size: number;

    /**
     * Number of elements from the beginning of the buffer
     */
    public offset: number;
}

/**
 * A WebGLBuffer wrap
 */
export class GLBuffer {

    private _hasAttributeLocation: boolean = false;

    // An element would be a set of three coordinates x,y and z
    private _elementSize: number;

    private _stride: number;
    private _buffer: WebGLBuffer;
    private _targetBufferType: number;
    private _dataType: number;
    private _mode: number;
    private _typeSize: number;

    private _data: number[] = [];
    private _attributes: AttributeInfo[] = [];

    /**
     * Creates a new GL buffer
     * 
     * @param elementSize : The size of each element in this buffer.
     * @param dataType : Data type of this buffer. Defaults to gl.FLOAT
     * @param targetBufferType : The buffer taget type. Defaults to gl.ARRAY_BUFFER
     * @param mode : The drawing mode of this buffer. Defaults to gl.TRIANGLES
     */
    public constructor(elementSize: number, dataType: number = gl.FLOAT, targetBufferType: number = gl.ARRAY_BUFFER, mode: number = gl.TRIANGLES) {

        this._elementSize = elementSize;
        this._dataType = dataType;
        this._targetBufferType = targetBufferType;
        this._mode = mode;

        switch (this._dataType) {
            case gl.FLOAT:
            case gl.INT:
            case gl.UNSIGNED_INT:
                this._typeSize = 4;
                break;

            case gl.SHORT:
            case gl.UNSIGNED_SHORT:
                this._typeSize = 2;
                break;

            case gl.BYTE:
            case gl.UNSIGNED_BYTE:
                this._typeSize = 1;
                break;

            default:
                throw new Error(`Unrecognised datatype ${this._dataType.toString()}`);
        }

        this._stride = this._elementSize * this._typeSize;
        this._buffer = gl.createBuffer() as WebGLBuffer;
    }

    /**
     * Delete the buffer from memory
     */
    public destroy(): void {
        gl.deleteBuffer(this._buffer);
    }

    /**
     * Binds this buffer
     * 
     * @param normalised : Indicates whther the data should be normalised
     */
    public bind(normalised: boolean = false): void {
        gl.bindBuffer(this._targetBufferType, this._buffer);

        if (this._hasAttributeLocation) {
            for (let attr of this._attributes) {
                gl.vertexAttribPointer(attr.location, attr.size, this._dataType, normalised, this._stride, attr.offset * this._typeSize);
                gl.enableVertexAttribArray(attr.location);
            }
        }
    }

    /**
     * Unbinds this buffer
     */
    public unbind(): void {
        for (let attr of this._attributes) {
            gl.disableVertexAttribArray(attr.location);
        }

        gl.bindBuffer(this._targetBufferType, this._buffer);
    }

    /**
     * Adds an attribute with the provided information to this buffer
     * @param info The information to be added
     */
    public addAttributeLocation(info: AttributeInfo): void {
        this._hasAttributeLocation = true;
        this._attributes.push(info);
    }

    /**
     * Adds data to this buffer
     * @param data 
     */
    public pushBackData(data: number[]): void {
        for (let d of data) {
            this._data.push(d);
        }
    }

    public upload(): void {

        gl.bindBuffer(this._targetBufferType, this._buffer);

        let bufferData: ArrayBuffer;

        switch (this._dataType) {
            case gl.FLOAT:
                bufferData = new Float32Array(this._data);
                break;

            case gl.INT:
                bufferData = new Int32Array(this._data);
                break;

            case gl.UNSIGNED_INT:
                bufferData = new Uint32Array(this._data);
                break;

            case gl.SHORT:
                bufferData = new Int16Array(this._data);
                break;

            case gl.UNSIGNED_SHORT:
                bufferData = new Uint16Array(this._data);
                break;

            case gl.BYTE:
                bufferData = new Int8Array(this._data);
                break;

            case gl.UNSIGNED_BYTE:
                bufferData = new Uint8Array(this._data);
                break;

            default:
                throw new Error(`Unrecognised datatype ${this._dataType.toString()} when uploading`);
        }

        gl.bufferData(this._targetBufferType, bufferData, gl.STATIC_DRAW);

    }

    /**
     * Draws this buffer
     */
    public draw(): void {
        if (this._targetBufferType === gl.ARRAY_BUFFER) {
            gl.drawArrays(this._mode, 0, this._data.length / this._elementSize);
        } else if (this._targetBufferType === gl.ELEMENT_ARRAY_BUFFER) {
            gl.drawElements(this._mode, this._data.length, this._dataType, 0);
        }
    }

}