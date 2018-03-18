import Buffer from "./buffer"

export default class VertexBuffer extends Buffer {
  target(gl) {
    return gl.ARRAY_BUFFER
  }
}