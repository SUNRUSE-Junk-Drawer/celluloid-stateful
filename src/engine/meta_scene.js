import Disposable from "./disposable"
import sceneCache from "./scene_cache"

export default class MetaScene extends Disposable {
  constructor(mainScenePath) {
    super()
    this.sceneInstances = []
    this.mainSceneInstance = this.createSceneInstance(mainScenePath)
  }

  createSceneInstance(path) {
    const sceneInstance = new SceneInstance(this, path)
    this.sceneInstances.push(sceneInstance)
    return sceneInstance
  }

  performDisposal() {
    while (this.sceneInstances.length) this.sceneInstances[0].dispose()
  }
}

class SceneInstance extends Disposable {
  constructor(metaScene, path) {
    super()
    this.metaScene = metaScene
    this.sceneNodeInstances = null
    this.sceneHandle = sceneCache.createHandle(path, scene => {
      if (scene == null) {
        this.sceneNodeInstances = null
        return
      }

      this.sceneNodeInstances = {}
      for (const name in scene.sceneNodes) new SceneNodeInstance(this, scene.sceneNodes[name])
    })
  }

  performDisposal() {
    this.sceneNodeInstances = null
    this.sceneHandle.dispose()
    this.metaScene.sceneInstances.splice(this.metaScene.sceneInstances.indexOf(this))
  }
}

class SceneNodeInstance {
  constructor(parent, sceneNode) {
    this.parent = parent
    this.sceneNode = sceneNode
    this.sceneNodeInstances = {}
    for (const name in sceneNode.sceneNodes) new SceneNodeInstance(this, sceneNode.sceneNodes[name])
    parent.sceneNodeInstances[sceneNode.name] = this
  }
}