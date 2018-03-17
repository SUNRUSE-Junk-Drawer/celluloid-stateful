import Data from "./data"
import DataInstance from "./data_instance"

export class Mesh extends Data {
  constructor(scene, name, locations, meshMaterials) {
    super(scene, name)
    this.locations = locations
    this.meshMaterials = meshMaterials
  }

  createInstance(sceneInstance) {
    this.checkNotDisposed()
    return new MeshInstance(sceneInstance, this)
  }

  performDisposal() { }
}

export class MeshMaterial {
  constructor(material, triangles) {
    this.material = material
    this.triangles = triangles
  }
}

class MeshInstance extends DataInstance {
  constructor(sceneInstance, data) {
    super(sceneInstance, data)
  }

  performDisposal() { }
}