import SceneData from "./scene_data"
import sceneCache from "./scene_cache"

export class SubScene extends SceneData {
  constructor(scene, name, path) {
    super(scene, name)
    this.path = path
    this.scene = null
    this.handle = sceneCache.createHandle(path, scene => this.scene = scene)
  }

  performDisposal() {
    this.handle.dispose()
    this.scene = null
  }
}