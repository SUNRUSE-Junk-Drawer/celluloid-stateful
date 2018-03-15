import { parseNumberAnimation } from "./number_animation"

export class Camera {
  constructor(name, clipStart, clipEnd, lens) {
    this.name = name
    this.clipStart = clipStart
    this.clipEnd = clipEnd
    this.lens = lens
  }
}

export function parseCamera(fileParser) {
  return new Camera(
    fileParser.utf8(),
    parseNumberAnimation(fileParser),
    parseNumberAnimation(fileParser),
    parseNumberAnimation(fileParser)
  )
}