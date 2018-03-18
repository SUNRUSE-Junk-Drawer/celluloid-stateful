import Disposable from "./../disposable"
import sceneCache from "./scene_cache"
import { vec3, mat4 } from "gl-matrix"

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

  renderGeometry(projectionMatrix) {
    this.sceneInstances.forEach(sceneInstance => sceneInstance.renderGeometry(projectionMatrix))
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
    this.frame = 0
    this.transform = mat4.create()
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
    this.frame = frame
    if (this.dataInstances) {
      for (const name in this.dataInstances) this.dataInstances[name].setFrame(frame)
      for (const name in this.rootNodeInstances) this.rootNodeInstances[name].setFrame(frame)
    }
  }

  render() {
    this.checkNotDisposed()
    this.viewports.forEach(viewport => viewport.render())
  }

  renderGeometry(projectionMatrix) {
    for (const name in this.rootNodeInstances) this.rootNodeInstances[name].renderGeometry(projectionMatrix)
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

const scale = vec3.create()

class NodeInstance {
  constructor(sceneInstance, parent, node) {
    this.parent = parent
    this.node = node

    if (node.data) {
      this.dataInstance = sceneInstance.dataInstances[node.data.name]
    } else {
      this.dataInstance = null
    }

    this.transform = mat4.create()

    this.nodeInstances = {}
    for (const name in node.nodes) new NodeInstance(sceneInstance, this, node.nodes[name])

    this.setFrame(sceneInstance.frame)

    sceneInstance.nodeInstances[node.name] = this
    const parentCollection = parent == sceneInstance ? parent.rootNodeInstances : parent.nodeInstances
    parentCollection[node.name] = this
  }

  setFrame(frame) {
    scale[0] = this.node.scale[0].sample(frame)
    scale[1] = this.node.scale[1].sample(frame)
    scale[2] = this.node.scale[2].sample(frame)
    mat4.fromScaling(this.transform, scale)

    mat4.rotateX(this.transform, this.transform, this.node.rotation[0].sample(frame))
    mat4.rotateY(this.transform, this.transform, this.node.rotation[1].sample(frame))
    mat4.rotateZ(this.transform, this.transform, this.node.rotation[2].sample(frame))

    this.transform[12] = this.node.translation[0].sample(frame)
    this.transform[13] = this.node.translation[1].sample(frame)
    this.transform[14] = this.node.translation[2].sample(frame)

    mat4.multiply(this.transform, this.parent.transform, this.transform)

    this.hide = this.node.hide.sample(frame)
    if (this.hide) return

    for (const name in this.nodeInstances) this.nodeInstances[name].setFrame(frame)
  }

  renderGeometry(projectionMatrix) {
    if (this.hide) return

    if (this.dataInstance) this.dataInstance.renderGeometry(projectionMatrix)
  }
}