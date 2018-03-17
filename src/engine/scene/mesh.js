import SceneData from "./scene_data"
import SceneDataInstance from "./scene_data_instance"

export class Mesh extends SceneData {
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

class MeshInstance extends SceneDataInstance {
  constructor(sceneInstance, sceneData) {
    super(sceneInstance, sceneData)
  }

  performDisposal() { }
}