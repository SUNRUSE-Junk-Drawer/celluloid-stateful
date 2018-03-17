import { parseNumberAnimation } from "./../animation/number_animation"
import { parseBooleanAnimation } from "./../animation/boolean_animation"
import Data from "./data"
import DataInstance from "./data_instance"

export class Material extends Data {
  constructor(scene, name, diffuseColor, diffuseIntensity, emit, useShadeless, useShadows, useCastShadows, useCastShadowsOnly) {
    super(scene, name)
    this.diffuseColor = diffuseColor
    this.diffuseIntensity = diffuseIntensity
    this.emit = emit
    this.useShadeless = useShadeless
    this.useShadows = useShadows
    this.useCastShadows = useCastShadows
    this.useCastShadowsOnly = useCastShadowsOnly
  }

  createInstance(sceneInstance) {
    this.checkNotDisposed()
    return new MaterialInstance(sceneInstance, this)
  }

  performDisposal() { }
}

class MaterialInstance extends DataInstance {
  constructor(sceneInstance, data) {
    super(sceneInstance, data)
  }

  performDisposal() { }
}