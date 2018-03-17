import Data from "./data"
import DataInstance from "./data_instance"

export class Lamp extends Data {
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

class LampInstance extends DataInstance {
  constructor(sceneInstance, data) {
    super(sceneInstance, data)
  }

  performDisposal() { }
}