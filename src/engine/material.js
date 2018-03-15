import { parseNumberAnimation } from "./number_animation"
import { parseBooleanAnimation } from "./boolean_animation"

export class Material {
  constructor(name, diffuseColor, diffuseIntensity, emit, useShadeless, useShadows, useCastShadows, useCastShadowsOnly) {
    this.name = name
    this.diffuseColor = diffuseColor
    this.diffuseIntensity = diffuseIntensity
    this.emit = emit
    this.useShadeless = useShadeless
    this.useShadows = useShadows
    this.useCastShadows = useCastShadows
    this.useCastShadowsOnly = useCastShadowsOnly
  }
}

export function parseMaterial(fileParser) {
  return new Material(
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