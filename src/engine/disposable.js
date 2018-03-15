export default class Disposable {
  constructor() {
    this.disposed = false
  }

  dispose() {
    if (this.disposed) throw new Error("Cannot dispose of a resource more than once")
    this.disposed = true
  }

  performDisposal() {
    throw new Error("This is to be implemented by the inheriting class")
  }
}