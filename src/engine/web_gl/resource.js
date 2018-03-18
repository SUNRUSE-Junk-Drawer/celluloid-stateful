import Disposable from "./../disposable"
import context from "./../context"

export default class Resource extends Disposable {
  constructor() {
    super()
    this.glNonce = null
  }

  bind() {
    this.checkNotDisposed()
    if (this.glNonce != context.glNonce) {
      this.created = this.performCreateAndBind(context.gl)
      this.glNonce = context.glNonce
    } else {
      this.performBind(context.gl, this.created)
    }
  }

  performCreateAndBind(gl) {
    throw new Error("This is to be implemented by the inheriting class")
  }

  performBind(gl, created) {
    throw new Error("This is to be implemented by the inheriting class")
  }

  performResourceDisposal(gl, created) {
    throw new Error("This is to be implemented by the inheriting class")
  }

  performDisposal() {
    if (this.glNonce == context.glNonce) {
      this.performResourceDisposal(context.gl, this.created)
      this.created = null
    }
  }
}