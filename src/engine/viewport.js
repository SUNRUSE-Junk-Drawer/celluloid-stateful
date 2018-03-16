import context from "./context"
import Disposable from "./disposable"

export const all = []

export default class Viewport extends Disposable {
  constructor(cameraGetter, left, bottom, right, top) {
    super()
    this.cameraGetter = cameraGetter
    this.left = left
    this.bottom = bottom
    this.right = right
    this.top = top
    all.push(this)
  }

  performDisposal() {
    all.splice(index, 1)
  }

  render() {
    const camera = this.cameraGetter()
    if (!camera) return
    camera.checkNotDisposed()
    const gl = context.gl
    const x = (this.left + 1) * context.width * 0.5
    const y = (this.bottom + 1) * context.height * 0.5
    const width = (this.right - this.left) * context.width * 0.5
    const height = (this.top - this.bottom) * context.height * 0.5
    gl.viewport(x, y, width, height)
    gl.scissor(x, y, width, height)
    gl.enable(gl.SCISSOR_TEST)
    gl.clear(gl.DEPTH_BUFFER_BIT)
    gl.disable(gl.SCISSOR_TEST)
  }
}