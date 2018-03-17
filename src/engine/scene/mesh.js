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

export function parseMesh(scene, fileParser, orderedMaterials) {
  const name = fileParser.utf8()
  const numberOfLocations = fileParser.uint16()
  const locations = fileParser.float32Array(numberOfLocations * 3)
  const numberOfMeshMaterials = fileParser.uint8()
  const meshMaterials = []
  while (meshMaterials.length < numberOfMeshMaterials) {
    meshMaterials.push(new MeshMaterial(
      orderedMaterials[fileParser.uint16()],
      fileParser.uint16Array(fileParser.uint16() * 3)
    ))
  }
  return new Mesh(scene, name, locations, meshMaterials)
}