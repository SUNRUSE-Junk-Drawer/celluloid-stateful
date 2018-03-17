import { parseNumberAnimation } from "./../animation/number_animation"
import { parseBooleanAnimation } from "./../animation/boolean_animation"

export class SceneNode {
  constructor(parent, name, translation, rotation, scale, hide, data) {
    this.parent = parent
    this.name = name
    this.sceneNodes = {}
    this.translation = translation
    this.rotation = rotation
    this.scale = scale
    this.hide = hide
    if (data) data.checkNotDisposed()
    this.data = data
    parent.sceneNodes[name] = this
  }
}

export function parseSceneNode(scene, fileParser, orderedSceneNodes, orderedData) {
  const name = fileParser.utf8()
  const type = fileParser.uint8()

  const parentId = fileParser.uint16()
  const parent = parentId == 65535 ? scene : orderedSceneNodes[parentId]

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

  return new SceneNode(parent, name, translation, rotation, scale, hide, data)
}