import { createFileHandle } from "./filesystem"
import FileParser from "./file_parser"
import { parseScene } from "./scene"
import SceneData from "./scene_data"

export class SubScene extends SceneData {
  constructor(scene, name, path) {
    super(scene, name)
    this.path = path
    this.scene = null
    this.fileHandle = createFileHandle(path, data => {
      if (this.scene) this.scene.dispose()
      this.scene = parseScene(new FileParser(data))
    })
  }

  performDisposal() {
    this.fileHandle.dispose()
    if (this.scene) {
      this.scene.dispose()
      this.scene = null
    }
  }
}