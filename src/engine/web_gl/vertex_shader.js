import Shader from "./shader"

export default class VertexShader extends Shader {
  type(gl) {
    return gl.VERTEX_SHADER
  }
}