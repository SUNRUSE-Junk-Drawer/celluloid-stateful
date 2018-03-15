import { parseNumberAnimation } from "./number_animation"
import { parseMaterial } from "./material"
import { parseMesh } from "./mesh"
import { parseLamp } from "./lamp"
import { parseCamera } from "./camera"
import { parseSceneNode } from "./scene_node"

export class Scene {
  constructor(ambientLightColor, ambientLightEnergy, data, sceneNodes) {
    this.ambientLightColor = ambientLightColor
    this.ambientLightEnergy = ambientLightEnergy
    this.data = data
    this.sceneNodes = sceneNodes
  }
}

export function parseScene(fileParser) {
  const ambientLightColor = [
    parseNumberAnimation(fileParser),
    parseNumberAnimation(fileParser),
    parseNumberAnimation(fileParser)
  ]
  const ambientLightEnergy = parseNumberAnimation(fileParser)

  const numberOfMaterials = fileParser.uint16()
  const orderedMaterials = []
  const materials = {}
  while (orderedMaterials.length < numberOfMaterials) {
    const material = parseMaterial(fileParser)
    orderedMaterials.push(material)
    materials[material.name] = material
  }

  const numberOfMeshes = fileParser.uint16()
  const orderedMeshes = []
  const meshes = {}
  while (orderedMeshes.length < numberOfMeshes) {
    const mesh = parseMesh(fileParser, orderedMaterials)
    orderedMeshes.push(mesh)
    meshes[mesh.name] = mesh
  }

  const numberOfLamps = fileParser.uint16()
  const orderedLamps = []
  const lamps = {}
  while (orderedLamps.length < numberOfLamps) {
    const lamp = parseLamp(fileParser)
    orderedLamps.push(lamp)
    lamps[lamp.name] = lamp
  }

  const numberOfCameras = fileParser.uint16()
  const orderedCameras = []
  const cameras = {}
  while (orderedCameras.length < numberOfCameras) {
    const camera = parseCamera(fileParser)
    orderedCameras.push(camera)
    cameras[camera.name] = camera
  }

  const data = { meshes, lamps, cameras }
  const orderedData = {
    meshes: orderedMeshes,
    lamps: orderedLamps,
    cameras: orderedCameras
  }

  const numberOfSceneNodes = fileParser.uint16()
  const orderedSceneNodes = []
  const sceneNodes = {}
  while (orderedSceneNodes.length < numberOfSceneNodes) {
    const sceneNode = parseSceneNode(fileParser, orderedSceneNodes, orderedData)
    orderedSceneNodes.push(sceneNode)
    sceneNodes[sceneNode.name] = sceneNode
  }

  return new Scene(ambientLightColor, ambientLightEnergy, data, sceneNodes)
}