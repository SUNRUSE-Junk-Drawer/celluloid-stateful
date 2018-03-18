import Shader from "./shader"

export default class FragmentShader extends Shader {
  type(gl) {
    return gl.FRAGMENT_SHADER
  }
}