import { watch } from "chokidar"
import Listenable from "./listenable"

const listenable = new Listenable()

const watcher = watch("data", {
  persistent: true,
  ignoreInitial: true
}).on("change", path => listenable.raise(path))

export default listenable