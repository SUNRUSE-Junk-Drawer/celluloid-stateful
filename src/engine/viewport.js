import context from "./context"
import Disposable from "./disposable"

export default class Viewport extends Disposable {
  constructor(sceneInstance, cameraNodeName, left, bottom, right, top) {
    super()

    sceneInstance.checkNotDisposed()

    this.sceneInstance = sceneInstance
    this.cameraNodeName = cameraNodeName
    this.left = left
    this.bottom = bottom
    this.right = right
    this.top = top

    this.sceneInstance.viewports.push(this)
  }

  performDisposal() {
    this.sceneInstance.viewports.splice(this.sceneInstance.viewports.indexOf(this), 1)
  }

  render() {
    if (!this.sceneInstance.nodeInstances) return

    const camera = this.sceneInstance.nodeInstances[this.cameraNodeName]
    if (!camera) return

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