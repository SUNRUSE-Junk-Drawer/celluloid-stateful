import Data from "./data"
import DataInstance from "./data_instance"

export class Camera extends Data {
  constructor(scene, name, clipStart, clipEnd, lens) {
    super(scene, name)
    this.clipStart = clipStart
    this.clipEnd = clipEnd
    this.lens = lens
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
  }

  performDisposal() { }
}