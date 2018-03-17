import Cache from "./../cache"
import { readFile } from "fs"
import { join } from "path"
import onFileChange from "./../filesystem/on_file_change"
import parseScene from "./parse_scene"
import FileParser from "./../filesystem/file_parser"

class SceneCache extends Cache {
  transform(key, then) {
    readFile(join("data", key), (err, data) => {
      if (err) {
        console.error(`Failed to read "${key}" as binary for a scene`, err)
        then(null)
      } else {
        let scene = null
        try {
          scene = parseScene(new FileParser(data.buffer))
        } catch (e) {
          console.error(`Failed to parse "${key}" as a scene`, e)
        }
        then(scene)
      }
    })
  }
}

const cache = new SceneCache()
onFileChange.listen(key => cache.changed(key))

export default cache