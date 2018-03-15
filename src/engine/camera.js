import { parseNumberAnimation } from "./number_animation"
import Disposable from "./disposable"

export class Camera extends Disposable {
  constructor(name, clipStart, clipEnd, lens) {
    super()
    this.name = name
    this.clipStart = clipStart
    this.clipEnd = clipEnd
    this.lens = lens
  }

  performDisposal() { }
}

export function parseCamera(fileParser) {
  return new Camera(
    fileParser.utf8(),
    parseNumberAnimation(fileParser),
    parseNumberAnimation(fileParser),
    parseNumberAnimation(fileParser)
  )
}