export default class Disposable {
  constructor() {
    this.disposed = false
  }

  dispose() {
    this.checkNotDisposed()
    this.disposed = true
  }

  checkNotDisposed() {
    if (this.disposed) throw new Error("Cannot use a disposed resource")
  }

  performDisposal() {
    throw new Error("This is to be implemented by the inheriting class")
  }
}