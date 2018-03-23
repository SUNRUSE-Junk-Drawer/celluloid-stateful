import Disposable from "./../disposable"

export default class Scene extends Disposable {
  constructor(ambientLightColor, ambientLightEnergy) {
    super()
    this.ambientLightColor = ambientLightColor
    this.ambientLightEnergy = ambientLightEnergy
    this.data = {
      material: {},
      mesh: {},
      lamp: {},
      camera: {}
    }
    this.nodes = {}
  }

  performDisposal() {
    for (const dataName in this.data) {
      this.data[dataName].dispose()
    }
  }
}