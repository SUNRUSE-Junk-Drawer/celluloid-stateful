import { watch } from "chokidar"
import Listenable from "./../listenable"

const listenable = new Listenable()

const watcher = watch(".", {
  persistent: true,
  ignoreInitial: true,
  cwd: "data"
}).on("change", path => listenable.raise(path))

export default listenable