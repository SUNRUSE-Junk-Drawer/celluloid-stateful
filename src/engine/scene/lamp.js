import { parseNumberAnimation } from "./../animation/number_animation"
import SceneData from "./scene_data"
import SceneDataInstance from "./scene_data_instance"

export class Lamp extends SceneData {
  constructor(scene, name, color, energy, distance, spotSize, shadowBufferSize) {
    super(scene, name)
    this.color = color
    this.energy = energy
    this.distance = distance
    this.spotSize = spotSize
    this.shadowBufferSize = shadowBufferSize
  }

  createInstance(sceneInstance) {
    this.checkNotDisposed()
    return new LampInstance(sceneInstance, this)
  }

  performDisposal() { }
}

class LampInstance extends SceneDataInstance {
  constructor(sceneInstance, sceneData) {
    super(sceneInstance, sceneData)
  }

  performDisposal() { }
}