import Buffer from "./buffer"
import context from "./../context"

export default class IndexBuffer extends Buffer {
  constructor(indices) {
    super(Math.max.apply(null, indices) < 256 ? new Uint8Array(indices) : new Uint16Array(indices))
    this.usesBytes = Math.max.apply(null, indices) < 256
  }

  target(gl) {
    return gl.ELEMENT_ARRAY_BUFFER
  }

  draw() {
    this.bind()
    context.gl.drawElements(context.gl.TRIANGLES, this.data.length, this.usesBytes ? context.gl.UNSIGNED_BYTE : context.gl.UNSIGNED_SHORT, 0)
  }
}