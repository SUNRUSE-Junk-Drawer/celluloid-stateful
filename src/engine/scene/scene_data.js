import Disposable from "./../disposable"

export default class SceneData extends Disposable {
  constructor(scene, name) {
    super()
    scene.checkNotDisposed()
    this.scene = scene
    this.name = name
    scene.data[name] = this
  }

  createInstance() {
    throw new Error("This is to be implemented by the inheriting class")
  }
}