import Data from "./data"
import DataInstance from "./data_instance"

export default class Mesh extends Data {
  constructor(scene, name, locations) {
    super(scene, name)
    this.locations = locations
    this.meshMaterials = []
  }

  addMaterial(material, triangles) {
    this.meshMaterials.push({ material, triangles })
  }

  createInstance(sceneInstance) {
    this.checkNotDisposed()
    return new MeshInstance(sceneInstance, this)
  }

  performDisposal() { }
}

class MeshInstance extends DataInstance {
  constructor(sceneInstance, data) {
    super(sceneInstance, data)
  }

  performDisposal() { }
}