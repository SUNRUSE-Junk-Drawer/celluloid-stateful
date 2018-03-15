import { parseNumberAnimation } from "./number_animation"
import Disposable from "./disposable"

export class Lamp extends Disposable {
  constructor(name, color, energy, distance, spotSize, shadowBufferSize) {
    super()
    this.name = name
    this.color = color
    this.energy = energy
    this.distance = distance
    this.spotSize = spotSize
    this.shadowBufferSize = shadowBufferSize
  }

  performDisposal() { }
}

export function parseLamp(fileParser) {
  return new Lamp(
    fileParser.utf8(),
    [
      parseNumberAnimation(fileParser),
      parseNumberAnimation(fileParser),
      parseNumberAnimation(fileParser)
    ],
    parseNumberAnimation(fileParser),
    parseNumberAnimation(fileParser),
    parseNumberAnimation(fileParser),
    fileParser.uint16()
  )
}