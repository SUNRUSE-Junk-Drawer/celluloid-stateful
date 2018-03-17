import Disposable from "./../disposable"

export default class DataInstance extends Disposable {
  constructor(sceneInstance, data) {
    super()

    this.sceneInstance = sceneInstance
    this.data = data

    this.sceneInstance.checkNotDisposed()
    this.data.checkNotDisposed()

    this.sceneInstance.data[this.data.name] = this
  }
}