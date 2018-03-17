import { parseNumberAnimation } from "./../animation/number_animation"
import SceneData from "./scene_data"
import SceneDataInstance from "./scene_data_instance"

export class Camera extends SceneData {
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

class CameraInstance extends SceneDataInstance {
  constructor(sceneInstance, sceneData) {
    super(sceneInstance, sceneData)
  }

  performDisposal() { }
}