import { parseNumberAnimation } from "./number_animation"
import { parseMaterial } from "./material"
import { parseMesh } from "./mesh"
import { parseLamp } from "./lamp"
import { parseCamera } from "./camera"
import { parseSceneNode } from "./scene_node"
import Disposable from "./disposable"

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

export function parseScene(fileParser) {
  const scene = new Scene([
    parseNumberAnimation(fileParser),
    parseNumberAnimation(fileParser),
    parseNumberAnimation(fileParser)
  ], parseNumberAnimation(fileParser))

  const numberOfMaterials = fileParser.uint16()
  const orderedMaterials = []
  while (orderedMaterials.length < numberOfMaterials) {
    const material = parseMaterial(scene, fileParser)
    orderedMaterials.push(material)
  }

  const numberOfMeshes = fileParser.uint16()
  const orderedMeshes = []
  while (orderedMeshes.length < numberOfMeshes) {
    const mesh = parseMesh(scene, fileParser, orderedMaterials)
    orderedMeshes.push(mesh)
  }

  const numberOfLamps = fileParser.uint16()
  const orderedLamps = []
  while (orderedLamps.length < numberOfLamps) {
    const lamp = parseLamp(scene, fileParser)
    orderedLamps.push(lamp)
  }

  const numberOfCameras = fileParser.uint16()
  const orderedCameras = []
  while (orderedCameras.length < numberOfCameras) {
    const camera = parseCamera(scene, fileParser)
    orderedCameras.push(camera)
  }

  const orderedData = {
    meshes: orderedMeshes,
    lamps: orderedLamps,
    cameras: orderedCameras
  }

  const numberOfSceneNodes = fileParser.uint16()
  const orderedSceneNodes = []
  while (orderedSceneNodes.length < numberOfSceneNodes) {
    const sceneNode = parseSceneNode(scene, fileParser, orderedSceneNodes, orderedData)
    orderedSceneNodes.push(sceneNode)
  }

  return scene
}