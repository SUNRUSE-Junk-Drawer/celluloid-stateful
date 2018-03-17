import SceneData from "./scene_data"

export class Mesh extends SceneData {
  constructor(scene, name, locations, meshMaterials) {
    super(scene, name)
    this.locations = locations
    this.meshMaterials = meshMaterials
  }

  performDisposal() { }
}

export class MeshMaterial {
  constructor(material, triangles) {
    this.material = material
    this.triangles = triangles
  }
}