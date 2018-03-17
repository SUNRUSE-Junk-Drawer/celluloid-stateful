import Disposable from "./../../disposable"

export default class DataInstance extends Disposable {
  constructor(sceneInstance, data) {
    super()

    this.sceneInstance = sceneInstance
    this.data = data

    this.sceneInstance.checkNotDisposed()
    this.data.checkNotDisposed()

    this.lastSetFrame = null

    this.sceneInstance.dataInstances[this.data.name] = this
  }

  setFrame(frame) {
    if (this.frame == this.lastSetFrame) return
    this.performSetFrame(frame)
    this.lastSetFrame = frame
  }

  performSetFrame(frame) {
    throw new Error("This is to be implemented by the inheriting class")
  }
}