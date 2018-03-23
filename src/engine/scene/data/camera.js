import Data from "./data"
import DataInstance from "./data_instance"

export default class Camera extends Data {
  constructor(scene, name, clipStart, clipEnd, angle) {
    super(scene, name)
    this.clipStart = clipStart
    this.clipEnd = clipEnd
    this.angle = angle
  }

  createInstance(sceneInstance) {
    this.checkNotDisposed()
    return new CameraInstance(sceneInstance, this)
  }

  performDisposal() { }
}

class CameraInstance extends DataInstance {
  constructor(sceneInstance, data) {
    super(sceneInstance, data)
    this.setFrame(sceneInstance.frame)
  }

  setFrame(frame) {
    this.clipStart = this.data.clipStart.sample(frame)
    this.clipEnd = this.data.clipEnd.sample(frame)
    this.angle = this.data.angle.sample(frame)
  }

  renderGeometry(projectionMatrix, transform) { }

  performDisposal() { }
}