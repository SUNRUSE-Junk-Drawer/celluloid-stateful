import Resource from "./resource"

export default class Buffer extends Resource {
  constructor(data) {
    super()
    this.data = data
    this.glNonce = null
  }

  target(gl) {
    throw new Error("This is to be implemented by the inheriting class")
  }

  performCreateAndBind(gl) {
    const buffer = gl.createBuffer()
    gl.bindBuffer(this.target(gl), buffer)
    gl.bufferData(this.target(gl), this.data, gl.STATIC_DRAW)
    return buffer
  }

  performBind(gl, created) {
    gl.bindBuffer(this.target(gl), created)
  }

  performResourceDisposal(gl, created) {
    gl.deleteBuffer(created)
    this.data = null
  }
}