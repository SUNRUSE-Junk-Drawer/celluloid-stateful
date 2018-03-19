import Disposable from "./../../disposable"

export default class DataInstance extends Disposable {
  constructor(sceneInstance, data) {
    super()

    this.sceneInstance = sceneInstance
    this.data = data

    this.sceneInstance.checkNotDisposed()
    this.data.checkNotDisposed()

    this.sceneInstance.dataInstances[this.data.name] = this
  }

  setFrame(frame) {
    throw new Error("This is to be implemented by the inheriting class")
  }

  renderGeometry(projectionMatrix, transform) {
    throw new Error("This is to be implemented by the inheriting class")
  }
}