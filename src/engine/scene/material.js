import { parseNumberAnimation } from "./../animation/number_animation"
import { parseBooleanAnimation } from "./../animation/boolean_animation"
import SceneData from "./scene_data"

export class Material extends SceneData {
  constructor(scene, name, diffuseColor, diffuseIntensity, emit, useShadeless, useShadows, useCastShadows, useCastShadowsOnly) {
    super(scene, name)
    this.diffuseColor = diffuseColor
    this.diffuseIntensity = diffuseIntensity
    this.emit = emit
    this.useShadeless = useShadeless
    this.useShadows = useShadows
    this.useCastShadows = useCastShadows
    this.useCastShadowsOnly = useCastShadowsOnly
  }

  performDisposal() { }
}

export function parseMaterial(scene, fileParser) {
  return new Material(
    scene,
    fileParser.utf8(),
    [
      parseNumberAnimation(fileParser),
      parseNumberAnimation(fileParser),
      parseNumberAnimation(fileParser)
    ],
    parseNumberAnimation(fileParser),
    parseNumberAnimation(fileParser),
    parseBooleanAnimation(fileParser),
    parseBooleanAnimation(fileParser),
    parseBooleanAnimation(fileParser),
    parseBooleanAnimation(fileParser)
  )
}