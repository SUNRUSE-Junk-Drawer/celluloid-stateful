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
    if (!camera || camera.disposed) return
  }
}