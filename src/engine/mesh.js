export class Mesh {
  constructor(name, locations, meshMaterials) {
    this.name = name
    this.locations = locations
    this.meshMaterials = meshMaterials
  }
}

export class MeshMaterial {
  constructor(material, triangles) {
    this.material = material
    this.triangles = triangles
  }
}

export function parseMesh(fileParser, orderedMaterials) {
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
  return new Mesh(name, locations, meshMaterials)
}