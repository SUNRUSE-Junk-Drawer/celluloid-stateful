import context from "./context"
import Disposable from "./disposable"
import { mat4 } from "gl-matrix"

const projectionMatrix = mat4.create()
const inverseViewMatrix = mat4.create()

export default class Viewport extends Disposable {
  constructor(sceneInstance, cameraNodeName, left, bottom, right, top, targetWidth, targetHeight) {
    super()

    sceneInstance.checkNotDisposed()

    this.sceneInstance = sceneInstance
    this.cameraNodeName = cameraNodeName
    this.left = left
    this.bottom = bottom
    this.right = right
    this.top = top
    this.targetWidth = targetWidth
    this.targetHeight = targetHeight

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

    const targetAspect = this.targetWidth / this.targetHeight
    const actualAspect = width / height

    const scale = Math.tan(camera.dataInstance.angle / 2) * camera.dataInstance.clipStart / targetAspect
    let xScale
    let yScale

    if (actualAspect > targetAspect) {
      xScale = scale * actualAspect
      yScale = scale
    } else {
      xScale = scale * targetAspect
      yScale = scale * targetAspect / actualAspect
    }

    mat4.frustum(
      projectionMatrix,
      -xScale,
      xScale,
      -yScale,
      yScale,
      camera.dataInstance.clipStart,
      camera.dataInstance.clipEnd
    )

    mat4.invert(inverseViewMatrix, camera.transform)
    mat4.multiply(projectionMatrix, projectionMatrix, inverseViewMatrix)

    this.sceneInstance.metaScene.renderGeometry(projectionMatrix)
  }
}