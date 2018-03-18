import Resource from "./resource"

export default class Shader extends Resource {
  constructor(source) {
    super()
    this.source = source
    this.glNonce = null
    this.programs = []
  }

  type(gl) {
    throw new Error("This is to be implemented by the inheriting class")
  }

  performCreateAndBind(gl) {
    const shader = gl.createShader(this.type(gl))
    gl.shaderSource(shader, this.source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS) && !gl.isContextLost()) {
      const message = gl.getShaderInfoLog(shader)
      gl.deleteShader(shader)
      throw new Error(`Error compiling a WebGL shader: "${message}"`)
    }
    return shader
  }

  performBind(gl, created) { }

  performResourceDisposal(gl, created) {
    while (this.programs.length) this.programs[0].dispose()
    gl.deleteShader(created)
    this.source = null
  }
}