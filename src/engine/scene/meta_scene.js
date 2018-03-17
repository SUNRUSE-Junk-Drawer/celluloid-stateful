import Disposable from "./../disposable"
import sceneCache from "./scene_cache"

export default class MetaScene extends Disposable {
  constructor(mainScenePath) {
    super()
    this.sceneInstances = []
    this.mainSceneInstance = this.createSceneInstance(mainScenePath)
  }

  createSceneInstance(path) {
    this.checkNotDisposed()
    const sceneInstance = new SceneInstance(this, path)
    this.sceneInstances.push(sceneInstance)
    return sceneInstance
  }

  render() {
    this.checkNotDisposed()
    this.sceneInstances.forEach(sceneInstance => sceneInstance.render())
  }

  performDisposal() {
    while (this.sceneInstances.length) this.sceneInstances[0].dispose()
  }
}

class SceneInstance extends Disposable {
  constructor(metaScene, path) {
    super()
    this.metaScene = metaScene
    this.dropCurrentInstance()
    this.sceneHandle = sceneCache.createHandle(path, scene => {
      if (scene == null) {
        this.dropCurrentInstance()
        return
      }

      this.dataInstances = {}
      for (const name in scene.data) scene.data[name].createInstance(this)

      this.nodeInstances = {}
      this.rootNodeInstances = {}
      for (const name in scene.nodes) new NodeInstance(this, this, scene.nodes[name])
    })
    this.viewports = []
  }

  setFrame(frame) {
    this.checkNotDisposed()
    for (const name in this.data) this.data[name].setFrame(frame)
  }

  render() {
    this.checkNotDisposed()
    this.viewports.forEach(viewport => viewport.render())
  }

  dropCurrentInstance() {
    if (this.dataInstances) {
      for (const name in this.dataInstances) this.dataInstances[name].dispose()
      this.dataInstances = null
    }

    this.nodeInstances = null
  }

  performDisposal() {
    this.dropCurrentInstance()
    this.sceneHandle.dispose()
    this.metaScene.sceneInstances.splice(this.metaScene.sceneInstances.indexOf(this))
    while (this.viewports.length) this.viewports[0].dispose()
  }
}

class NodeInstance {
  constructor(sceneInstance, parent, node) {
    this.parent = parent
    this.node = node

    if (node.data) {
      this.dataInstance = sceneInstance.dataInstances[node.data.name]
    } else {
      this.dataInstance = null
    }

    this.nodeInstances = {}
    for (const name in node.nodes) new NodeInstance(sceneInstance, this, node.nodes[name])

    sceneInstance.nodeInstances[node.name] = this
    const parentCollection = parent == sceneInstance ? parent.rootNodeInstances : parent.nodeInstances
    parentCollection[node.name] = this
  }
}