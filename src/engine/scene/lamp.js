import { parseNumberAnimation } from "./../animation/number_animation"
import SceneData from "./scene_data"

export class Lamp extends SceneData {
  constructor(scene, name, color, energy, distance, spotSize, shadowBufferSize) {
    super(scene, name)
    this.color = color
    this.energy = energy
    this.distance = distance
    this.spotSize = spotSize
    this.shadowBufferSize = shadowBufferSize
  }

  performDisposal() { }
}