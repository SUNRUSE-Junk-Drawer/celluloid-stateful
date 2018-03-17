import { parseNumberAnimation } from "./../animation/number_animation"
import { parseMaterial } from "./material"
import { parseMesh } from "./mesh"
import { parseLamp } from "./lamp"
import { parseCamera } from "./camera"
import { parseSceneNode } from "./scene_node"
import Disposable from "./../disposable"

export class Scene extends Disposable {
  constructor(ambientLightColor, ambientLightEnergy) {
    super()
    this.ambientLightColor = ambientLightColor
    this.ambientLightEnergy = ambientLightEnergy
    this.data = {}
    this.sceneNodes = {}
  }

  performDisposal() {
    for (const dataName in this.data) {
      this.data[dataName].dispose()
    }
  }
}