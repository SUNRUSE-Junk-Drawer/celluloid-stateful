import { parseNumberAnimation } from "./../animation/number_animation"
import { parseBooleanAnimation } from "./../animation/boolean_animation"

export default class Node {
  constructor(parent, name, translation, rotation, scale, hide, data) {
    this.parent = parent
    this.name = name
    this.nodes = {}
    this.translation = translation
    this.rotation = rotation
    this.scale = scale
    this.hide = hide
    if (data) data.checkNotDisposed()
    this.data = data
    parent.nodes[name] = this
  }
}