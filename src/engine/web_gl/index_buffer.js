import Buffer from "./buffer"

export default class IndexBuffer extends Buffer {
  constructor(indices) {
    super(Math.max.apply(null, indices) < 256 ? new Uint8Array(indices) : new Uint16Array(indices))
  }

  target(gl) {
    return gl.ELEMENT_ARRAY_BUFFER
  }
}