import Resource from "./resource"

export default class Program extends Resource {
  constructor(vertexShader, fragmentShader) {
    super()

    vertexShader.checkNotDisposed()
    fragmentShader.checkNotDisposed()

    this.vertexShader = vertexShader
    this.fragmentShader = fragmentShader

    this.vertexShader.programs.push(this)
    this.fragmentShader.programs.push(this)
  }

  performCreateAndBind(gl) {
    const program = gl.createProgram()
    const vertexShader = this.vertexShader.bind()
    const fragmentShader = this.fragmentShader.bind()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS) && !gl.isContextLost()) {
      const message = gl.getProgramInfoLog(program)
      gl.detachShader(program, vertexShader)
      gl.detachShader(program, fragmentShader)
      gl.deleteProgram(program)
      throw new Error(`Error linking a WebGL program: "${message}"`)
    }
    gl.useProgram(program)

    this.attributes = {}
    const numberOfAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES)
    for (let i = 0; i < numberOfAttributes; i++) {
      const attribute = gl.getActiveAttrib(program, i)
      this.attributes[attribute.name] = i
    }

    this.uniforms = {}
    const numberOfUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
    for (let i = 0; i < numberOfUniforms; i++) {
      const uniform = gl.getActiveUniform(program, i)
      this.uniforms[uniform.name] = gl.getUniformLocation(program, uniform.name)
    }
    return program
  }

  performBind(gl, created) {
    gl.useProgram(created)
  }

  performDisposal() {
    super.performDisposal()
    this.vertexShader.programs.splice(this.vertexShader.programs.indexOf(this), 1)
    this.fragmentShader.programs.splice(this.fragmentShader.programs.indexOf(this), 1)
  }

  performResourceDisposal(gl, created) {
    gl.detachShader(program, vertexShader)
    gl.detachShader(program, fragmentShader)
    gl.deleteProgram(program)
    this.source = null
  }
}