import Data from "./data"
import DataInstance from "./data_instance"
import { vec3 } from "gl-matrix"

export default class Material extends Data {
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
    this.diffuseColor = vec3.create()
    this.setFrame(0)
  }

  setFrame(frame) {
    this.diffuseColor[0] = this.data.diffuseColor[0].sample(frame)
    this.diffuseColor[1] = this.data.diffuseColor[1].sample(frame)
    this.diffuseColor[2] = this.data.diffuseColor[2].sample(frame)
    vec3.scale(this.diffuseColor, this.diffuseColor, this.data.diffuseIntensity.sample(frame))
    this.emit = this.data.emit.sample(frame)
  }

  performDisposal() { }
}