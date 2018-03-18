import Data from "./data"
import DataInstance from "./data_instance"
import { vec3 } from "gl-matrix"

export default class Lamp extends Data {
  constructor(scene, name, color, energy, spotSize, shadowBufferSize, shadowBufferClipStart, shadowBufferClipEnd) {
    super(scene, name)
    this.color = color
    this.energy = energy
    this.spotSize = spotSize
    this.shadowBufferSize = shadowBufferSize
    this.shadowBufferClipStart = shadowBufferClipStart
    this.shadowBufferClipEnd = shadowBufferClipEnd
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
    this.setFrame(sceneInstance.frame)
  }

  setFrame(frame) {
    this.color[0] = this.data.color[0].sample(frame)
    this.color[1] = this.data.color[1].sample(frame)
    this.color[2] = this.data.color[2].sample(frame)
    vec3.scale(this.color, this.color, this.data.energy.sample(frame))
    this.spotSize = this.data.spotSize.sample(frame)
    this.shadowBufferClipStart = this.data.shadowBufferClipStart.sample(frame)
    this.shadowBufferClipEnd = this.data.shadowBufferClipEnd.sample(frame)
  }

  renderGeometry(projectionMatrix) { }

  performDisposal() { }
}