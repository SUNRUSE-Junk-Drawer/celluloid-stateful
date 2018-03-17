import Data from "./data"
import DataInstance from "./data_instance"
import { vec3 } from "gl-matrix"

export default class Lamp extends Data {
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
    this.color = vec3.create()
    this.setFrame(0)
  }

  performSetFrame(frame) {
    this.color[0] = this.data.color[0].sample(frame)
    this.color[1] = this.data.color[1].sample(frame)
    this.color[2] = this.data.color[2].sample(frame)
    vec3.scale(this.color, this.color, this.data.energy.sample(frame))
    this.distance = this.data.distance.sample(frame)
    this.spotSize = this.data.spotSize.sample(frame)
  }

  performDisposal() { }
}