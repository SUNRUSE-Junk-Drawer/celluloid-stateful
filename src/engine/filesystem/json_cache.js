import Cache from "./../cache"
import { readFile } from "fs"
import { join } from "path"
import onFileChange from "./on_file_change"

const readFileOptions = { encoding: "UTF8" }

class JsonCache extends Cache {
  transform(key, then) {
    readFile(join("data", key), readFileOptions, (err, data) => {
      if (err) {
        console.error(`Failed to read "${key}" as text for JSON`, err)
        then(null)
      } else {
        let value = null
        try {
          value = JSON.parse(data)
        } catch (e) {
          console.error(`Failed to parse "${key}" as JSON`, e)
        }
        then(value)
      }
    })
  }
}

const cache = new JsonCache()
onFileChange.listen(key => cache.changed(key))

export default cache