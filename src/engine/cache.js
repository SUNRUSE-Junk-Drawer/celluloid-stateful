import Disposable from "./disposable"

export default class Cache extends Disposable {
  constructor() {
    super()
    this.items = {}
  }

  changed(key) {
    this.checkNotDisposed()
    if (!Object.prototype.hasOwnProperty.call(this.items, key)) return
    this.items[key].changed()
  }

  createHandle(key, callback) {
    this.checkNotDisposed()
    if (!Object.prototype.hasOwnProperty.call(this.items, key)) {
      this.items[key] = new Item(this, key)
    }
    return this.items[key].createHandle(callback)
  }

  removeItem(item) {
    delete this.items[item.key]
  }

  transform(key, then) {
    throw new Error("This is to be implemented by the inheriting class")
  }

  performDisposal() {
    for (const key in this.items) this.items[key].dispose()
  }
}

class Item extends Disposable {
  constructor(cache, key) {
    super()
    this.cache = cache
    this.key = key
    this.handles = []
    this.data = undefined
    this.nonce = 0
    this.changed()
  }

  createHandle(callback) {
    const handle = new Handle(this, callback)
    this.handles.push(handle)
    if (this.data !== undefined) handle.changed()
    return handle
  }

  removeHandle(handle) {
    this.handles.splice(this.handles.indexOf(handle), 1)
    if (!this.handles.length) this.dispose()
  }

  changed() {
    if (this.data instanceof Disposable) this.data.dispose()
    this.data = undefined
    this.nonce++
    const nonceCopy = this.nonce
    this.cache.transform(this.key, data => {
      if (this.nonce != nonceCopy) return
      this.data = data
      this.handles.forEach(handle => handle.changed())
    })
  }

  performDisposal() {
    while (this.handles.length) this.handles[0].dispose()
    if (this.data instanceof Disposable) this.data.dispose()
    this.data = undefined
    this.nonce++
    this.cache.removeItem(this)
  }
}

class Handle extends Disposable {
  constructor(item, callback) {
    super()
    this.item = item
    this.callback = callback
  }

  changed() {
    this.callback(this.item.data)
  }

  performDisposal() {
    this.item.removeHandle(this)
  }
}