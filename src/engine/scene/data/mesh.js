import Data from "./data"
import DataInstance from "./data_instance"
import VertexBuffer from "./../../web_gl/vertex_buffer"
import IndexBuffer from "./../../web_gl/index_buffer"
import VertexShader from "./../../web_gl/vertex_shader"
import FragmentShader from "./../../web_gl/fragment_shader"
import Program from "./../../web_gl/program"
import context from "./../../context"
import { mat4 } from "gl-matrix"

export default class Mesh extends Data {
  constructor(scene, name, locations) {
    super(scene, "mesh", name)
    this.locations = locations
    this.meshMaterials = []
    this.vertexBuffer = null
    this.indexBuffer = null
  }

  addMaterial(material, triangles) {
    this.meshMaterials.push({ material, triangles })
  }

  createInstance(sceneInstance) {
    this.checkNotDisposed()
    if (!this.vertexBuffer) {
      const vertexBytes = []
      const indices = []

      const locationBytes = new Uint8Array(this.locations.buffer)

      this.meshMaterials.forEach((meshMaterial, materialIndex) => {
        const visitedLocations = {}
        meshMaterial.triangles.forEach(locationIndex => {
          if (!visitedLocations[locationIndex]) {
            visitedLocations[locationIndex] = vertexBytes.length / 16
            for (let i = locationIndex * 3 * 4; i < (locationIndex + 1) * 3 * 4; i++) {
              vertexBytes.push(locationBytes[i])
            }
            vertexBytes.push(materialIndex)
            vertexBytes.push(0)
            vertexBytes.push(0)
            vertexBytes.push(0)
          }
          indices.push(visitedLocations[locationIndex])
        })
        meshMaterial.triangles = null
      })

      this.vertexBuffer = new VertexBuffer(new Uint8Array(vertexBytes))
      this.indexBuffer = new IndexBuffer(indices)

      this.locations = null
    }

    return new MeshInstance(sceneInstance, this)
  }

  performDisposal() {
    if (this.vertexBuffer) {
      this.vertexBuffer.dispose()
      this.vertexBuffer = null
    }

    if (this.indexBuffer) {
      this.indexBuffer.dispose()
      this.indexBuffer = null
    }

    this.locations = null
    this.meshMaterials = null
  }
}

const vertexShader = new VertexShader(`
  #ifdef GL_ES
    precision mediump float;
  #endif

  attribute vec3 aLocation;
  attribute float aMaterial;

  uniform mat4 uTransform;
  uniform vec4 uMaterials[32];

  varying vec4 vColor;

  void main() {
    vColor = uMaterials[int(aMaterial)];
    gl_Position = uTransform * vec4(aLocation, 1.0);
  }
`)

const fragmentShader = new FragmentShader(`
  #ifdef GL_ES
    precision mediump float;
  #endif

  varying vec4 vColor;

  void main() {
    gl_FragColor = vec4(vColor.rgb, 1.0);
  }
`)

const program = new Program(vertexShader, fragmentShader)

const projected = mat4.create()

class MeshInstance extends DataInstance {
  constructor(sceneInstance, data) {
    super(sceneInstance, data)
    this.materials = new Float32Array(data.meshMaterials.length * 4)
    this.materialInstances = data.meshMaterials.map(meshMaterial => sceneInstance.dataInstances.material[meshMaterial.material.name])
  }

  setFrame(frame) { }

  renderGeometry(projectionMatrix, transform) {
    let offset = 0
    for (let i = 0; i < this.materialInstances.length; i++) {
      this.materials[offset++] = this.materialInstances[i].diffuseColor[0]
      this.materials[offset++] = this.materialInstances[i].diffuseColor[1]
      this.materials[offset++] = this.materialInstances[i].diffuseColor[2]
      this.materials[offset++] = this.materialInstances[i].emit
    }
    program.bind()
    mat4.multiply(projected, projectionMatrix, transform)
    context.gl.uniformMatrix4fv(program.uniforms.uTransform, false, projected)
    context.gl.uniform4fv(program.uniforms["uMaterials[0]"], this.materials)
    this.data.vertexBuffer.bind()
    context.gl.enableVertexAttribArray(program.attributes.aLocation)
    context.gl.vertexAttribPointer(program.attributes.aLocation, 3, context.gl.FLOAT, false, 16, 0)
    context.gl.enableVertexAttribArray(program.attributes.aMaterial)
    context.gl.vertexAttribPointer(program.attributes.aMaterial, 1, context.gl.UNSIGNED_BYTE, false, 16, 12)
    this.data.indexBuffer.draw()
    context.gl.disableVertexAttribArray(program.attributes.aLocation)
    context.gl.disableVertexAttribArray(program.attributes.aMaterial)
  }

  performDisposal() { }
}