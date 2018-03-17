import Disposable from "./../disposable"

export default class SceneDataInstance extends Disposable {
  constructor(sceneInstance, sceneData) {
    super()

    this.sceneInstance = sceneInstance
    this.sceneData = sceneData

    this.sceneInstance.checkNotDisposed()
    this.sceneData.checkNotDisposed()

    this.sceneInstance.data[this.sceneData.name] = this
  }
}