import { parseNumberAnimation } from "./number_animation"

export class Lamp {
  constructor(name, color, energy, distance, spotSize, shadowBufferSize) {
    this.name = name
    this.color = color
    this.energy = energy
    this.distance = distance
    this.spotSize = spotSize
    this.shadowBufferSize = shadowBufferSize
  }
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