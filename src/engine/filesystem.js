import { watch } from "chokidar"
import { readFile } from "fs"
import { join } from "path"

const files = {}

function tryFindFile(path) {
  if (!Object.prototype.hasOwnProperty.call(files, path)) return null
  return files[path]
}

const watcher = watch("data", {
  persistent: true,
  ignoreInitial: true
}).on("change", path => {
  const file = tryFindFile(path)
  if (!file) return
  file.load()
})

class File {
  constructor(path) {
    this.path = path
    this.handles = []
    this.nonce = 0
    this.data = null
  }

  load() {
    if (!this.handles.length) return
    this.nonce++
    const nonce = this.nonce
    readFile(this.path, (err, data) => {
      if (err) throw err
      if (nonce != this.nonce) return
      this.data = data.buffer
      this.handles.forEach(handle => handle.callback(this.data))
    })
  }

  createHandle(callback) {
    const handle = new Handle(this, callback)
    this.handles.push(handle)
    if (this.data) callback(this.data)
    if (this.handles.length == 1) this.load()
    return handle
  }

  removeHandle(handle) {
    this.handles.splice(this.handles.indexOf(handle), 1)
    if (this.handles.length) return
    delete files[this.path]
    this.data = null
    this.nonce++
  }
}

class Handle {
  constructor(file, callback) {
    this.file = file
    this.callback = callback
    this.released = false
  }

  release() {
    if (this.released) throw new Error("Cannot release a Handle more than once")
    this.released = true
    this.file.removeHandle(this)
  }
}

export function createFileHandle(path, callback) {
  path = join("data", path)
  let file = tryFindFile(path)
  if (!file) {
    file = new File(path)
    files[path] = file
  }
  return file.createHandle(callback)
}