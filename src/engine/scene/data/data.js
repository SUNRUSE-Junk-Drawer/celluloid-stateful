import Disposable from "./../../disposable"

export default class Data extends Disposable {
  constructor(scene, type, name) {
    super()
    scene.checkNotDisposed()
    this.scene = scene
    this.type = type
    this.name = name
    scene.data[type][name] = this
  }

  createInstance() {
    throw new Error("This is to be implemented by the inheriting class")
  }
}