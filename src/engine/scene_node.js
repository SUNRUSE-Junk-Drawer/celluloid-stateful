import { parseNumberAnimation } from "./number_animation"
import { parseBooleanAnimation } from "./boolean_animation"

export class SceneNode {
  constructor(scene, name, parent, translation, rotation, scale, hide, data) {
    scene.checkNotDisposed()
    this.scene = scene
    this.name = name
    this.parent = parent
    this.translation = translation
    this.rotation = rotation
    this.scale = scale
    this.hide = hide
    this.data = data
    scene.sceneNodes[name] = this
  }
}

export function parseSceneNode(scene, fileParser, orderedSceneNodes, orderedData) {
  const name = fileParser.utf8()
  const type = fileParser.uint8()

  const parentId = fileParser.uint16()
  const parent = parentId == 65535 ? null : orderedSceneNodes[parentId]

  const translation = [
    parseNumberAnimation(fileParser),
    parseNumberAnimation(fileParser),
    parseNumberAnimation(fileParser)
  ]

  const scale = [
    parseNumberAnimation(fileParser),
    parseNumberAnimation(fileParser),
    parseNumberAnimation(fileParser)
  ]

  const rotation = [
    parseNumberAnimation(fileParser),
    parseNumberAnimation(fileParser),
    parseNumberAnimation(fileParser)
  ]

  const hide = parseBooleanAnimation(fileParser)

  let data = null
  switch (type) {
    case 1:
      data = orderedData.meshes[fileParser.uint16()]
      break
    case 2:
      data = orderedData.lamps[fileParser.uint16()]
      break
    case 3:
      data = orderedData.cameras[fileParser.uint16()]
      break
  }

  return new SceneNode(scene, name, parent, translation, rotation, scale, hide, data)
}