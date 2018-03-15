import Disposable from "./disposable"

export default class SceneData extends Disposable {
  constructor(scene, name) {
    super()
    if (scene.disposed) throw new Error("Cannot add SceneData to a disposed Scene")
    this.scene = scene
    this.name = name
    scene.data[name] = this
  }
}