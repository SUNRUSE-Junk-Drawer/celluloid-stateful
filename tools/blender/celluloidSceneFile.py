bl_info = {
  "name": "Celluloid Scene File",
  "category": "Import-Export"
}

import bpy, bpy_extras, json, bmesh

def initialize_material(material):
  material.diffuse_shader = "TOON"
  material.diffuse_toon_size = 1
  material.diffuse_toon_smooth = 0
  material.specular_intensity = 0

class CelluloidPanel(bpy.types.Panel):
  bl_idname = "OBJECT_PT_celluloid"
  bl_label = "Celluloid"
  bl_space_type = "VIEW_3D"
  bl_region_type = "TOOLS"
  bl_category = "Tools"

  def draw(self, context):
    self.layout.operator("celluloid.setup_scene", text="Setup Scene")
    self.layout.operator("import.celluloidscenefile", text="Import")
    self.layout.operator("export.celluloidscenefile", text="Export")
    self.layout.operator("celluloid.lamp_add", text="Add Lamp")

class SetupCelluloidScene(bpy.types.Operator):
  bl_idname = "celluloid.setup_scene"
  bl_label = "Setup Celluloid Scene"

  def execute(self, context):
    bpy.context.scene.unit_settings.system = "METRIC"
    bpy.context.scene.unit_settings.scale_length = 1
    bpy.context.scene.render.use_edge_enhance = True
    bpy.context.space_data.show_backface_culling = True;
    for material in bpy.data.materials:
        initialize_material(material)
    return {"FINISHED"}

class ImportCelluloidSceneFile(bpy.types.Operator, bpy_extras.io_utils.ImportHelper):
  """Import Celluloid Scene File"""
  bl_idname = "import.celluloidscenefile"
  bl_label = "Import Celluloid Scene File (*.json)"

  filename_ext = ".json"

  def execute(self, context):
    file = open(self.properties.filepath, "r")
    json_string = file.read()
    file.close()
    json_object = json.loads(json_string)
    bpy.context.scene.render.fps = json_object["framesPerSecond"]["numerator"]
    bpy.context.scene.render.fps_base = json_object["framesPerSecond"]["denominator"]
    bpy.ops.celluloid.setup_scene()

    def read_animation(keyframes, object, property_name, is_boolean):
      if not isinstance(keyframes[0], list): keyframes = [keyframes]
      first_keyframe_values = []
      for axis_index, axis in enumerate(keyframes):
        first_keyframe_values.append(axis[0]["withValue"])
        if len(axis) == 1 and (is_boolean or axis[0]["type"] == "constant") and axis[0]["startsOnFrame"] == 0: continue
        fcurve = object.animation_data.action.fcurves.new(property_name, axis_index)
        for keyframe in axis:
          created = fcurve.keyframe_points.insert(keyframe["startsOnFrame"], keyframe["withValue"])
          if is_boolean or keyframe["type"] == "constant": created.interpolation = "CONSTANT"
          elif keyframe["type"] == "linear": created.interpolation = "LINEAR"
      setattr(object, property_name, first_keyframe_values if len(first_keyframe_values) > 1 else first_keyframe_values[0])

    allData = {
      "material": {},
      "mesh": {},
      "light": {}
    }

    for material_name, material in json_object["data"]["materials"].items():
      created = bpy.data.materials.new(name=material_name)
      created.animation_data_create()
      created.animation_data.action = bpy.data.actions.new(name="")

      read_animation(material["diffuseColor"], created, "diffuse_color", False)
      read_animation(material["diffuseIntensity"], created, "diffuse_intensity", False)
      read_animation(material["emit"], created, "emit", False)
      read_animation(material["useShadeless"], created, "use_shadeless", True)
      read_animation(material["useCastShadows"], created, "use_cast_shadows", True)
      read_animation(material["useCastShadowsOnly"], created, "use_cast_shadows_only", True)
      initialize_material(created)

      allData["material"][material_name] = created

    for mesh_name, mesh in json_object["data"]["meshes"].items():
      bm = bmesh.new()
      for index, location in enumerate(mesh["locations"]): bm.verts.new(location)
      bm.verts.ensure_lookup_table()

      ordered_materials = []
      for polygon in mesh["polygons"]:
        if polygon["material"] not in ordered_materials: ordered_materials.append(polygon["material"])
        vertices = []
        for vertex in polygon["indices"]:
          vertices.append(bm.verts[vertex])
        face = bm.faces.new(vertices)
        face.material_index = ordered_materials.index(polygon["material"])

      mesh = bpy.data.meshes.new(mesh_name)
      for material_name in ordered_materials: mesh.materials.append(allData["material"][material_name])

      bm.to_mesh(mesh)
      allData["mesh"][mesh_name] = mesh

    lights = {}
    for light_name, light in json_object["data"]["lights"].items():
      type = None
      if light["falloff"]["type"] == "sphere": type = "POINT"
      elif light["falloff"]["type"] == "cone": type = "SPOT"
      created = bpy.data.lamps.new(name=light_name, type=type)
      created.animation_data_create()
      created.animation_data.action = bpy.data.actions.new(name="")
      read_animation(light["color"], created, "color", False)
      if light["falloff"]["type"] == "sphere":
        read_animation(light["falloff"]["multiplier"], created, "energy", False)
        read_animation(light["falloff"]["negative"], created, "use_negative", True)
        read_animation(light["falloff"]["radius"], created, "distance", False)
        created.use_sphere = True
        created.shadow_method = "NOSHADOW"
        created.falloff_type = "INVERSE_LINEAR"
      elif light["falloff"]["type"] == "cone":
        read_animation(light["falloff"]["multiplier"], created, "energy", False)
        read_animation(light["falloff"]["negative"], created, "use_negative", True)
        read_animation(light["falloff"]["radius"], created, "distance", False)
        read_animation(light["falloff"]["spotSize"], created, "spot_size", False)
        created.spot_blend = 1
        created.use_halo = True
        created.use_sphere = True
        created.shadow_method = "NOSHADOW"
        created.falloff_type = "INVERSE_LINEAR"
      allData["light"][light_name] = created

    def recurse(parent_name, parent):
      for object_name, object in json_object["sceneNodes"].items():
        if object["parent"] != parent_name: continue
        data = None
        if "data" in object: data = allData[object["type"]][object["data"]]
        created = bpy.data.objects.new(object_name, data)
        created.animation_data_create()
        created.animation_data.action = bpy.data.actions.new(name="")
        bpy.context.scene.objects.link(created)
        if parent_name != None: created.parent = parent
        read_animation(object["transform"]["translation"], created, "location", False)
        read_animation(object["transform"]["rotation"], created, "rotation_euler", False)
        read_animation(object["transform"]["scale"], created, "scale", False)
        recurse(object_name, created)

    recurse(None, None)

    return {"FINISHED"}

class ExportCelluloidSceneFile(bpy.types.Operator, bpy_extras.io_utils.ExportHelper):
  """Export Celluloid Scene File"""
  bl_idname = "export.celluloidscenefile"
  bl_label = "Export Celluloid Scene File (*.json)"

  filename_ext = ".json"

  def execute(self, context):
    scene_nodes = {}
    materials = {}
    meshes = {}
    lights = {}

    if bpy.context.scene.unit_settings.system != "METRIC" or bpy.context.scene.unit_settings.scale_length != 1:
      self.report({"ERROR"}, "The scene is not in meters.")
      return {"FINISHED"}

    def write_animation(object, data_object, property_name, axes, is_boolean):
      fallback = getattr(data_object, property_name)
      if axes == 1: fallback = [fallback]

      output = []
      for axis in range(0, axes):
        found = False

        if data_object.animation_data and data_object.animation_data.action and data_object.animation_data.action.fcurves:
          for curve in data_object.animation_data.action.fcurves:
            if curve.data_path != property_name: continue
            if curve.array_index != axis: continue
            curve.update()
            if (curve.extrapolation != "CONSTANT"): 
              self.report({"ERROR"}, "Object \"" + object.name + "\" contains unexpected extrapolation type \"" + curve.extrapolation + "\".")
              return False

            keyframes = []
            for keyframe in curve.keyframe_points:
              value = keyframe.co[1]
              if is_boolean: value = value != 0
              exported = {
                "startsOnFrame": keyframe.co[0],
                "withValue": value
              }
              if is_boolean:
                if keyframe.interpolation != "CONSTANT":
                  self.report({"ERROR"}, "Object \"" + object.name + "\" contains unexpected interpolation type \"" + keyframe.interpolation + "\".")
                  return False
              else:
                if keyframe.interpolation == "CONSTANT": exported["type"] = "constant"
                elif keyframe.interpolation == "LINEAR": exported["type"] = "linear"
                else: 
                  self.report({"ERROR"}, "Object \"" + object.name + "\" contains unexpected interpolation type \"" + keyframe.interpolation + "\".")
                  return False
              keyframes.append(exported)

            output.append(keyframes)

            found = True
            break

        if not found: 
          if is_boolean:
            output.append([{
              "startsOnFrame": 0,
              "withValue": fallback[axis]
            }])
          else:
            output.append([{
              "type": "constant",
              "startsOnFrame": 0,
              "withValue": fallback[axis]
            }])

      return output if axes > 1 else output[0]

    for material_name, material in bpy.data.materials.items():
      materials[material_name] = {
        "diffuseColor": write_animation(material, material, "diffuse_color", 3, False),
        "diffuseIntensity": write_animation(material, material, "diffuse_intensity", 1, False),
        "emit": write_animation(material, material, "emit", 1, False),
        "useShadeless": write_animation(material, material, "use_shadeless", 1, True),
        "useCastShadows": write_animation(material, material, "use_cast_shadows", 1, True),
        "useCastShadowsOnly": write_animation(material, material, "use_cast_shadows_only", 1, True)
      }

      if not materials[material_name]["diffuseColor"]: return {"FINISHED"}
      if not materials[material_name]["diffuseIntensity"]: return {"FINISHED"}
      if not materials[material_name]["emit"]: return {"FINISHED"}
      if not materials[material_name]["useShadeless"]: return {"FINISHED"}
      if not materials[material_name]["useCastShadows"]: return {"FINISHED"}
      if not materials[material_name]["useCastShadowsOnly"]: return {"FINISHED"}

    for object in bpy.context.scene.objects:
      is_identity = True
      for row_index, row in enumerate(object.matrix_parent_inverse):
        for column_index, column in enumerate(row):
          expected = 0
          if row_index == column_index:
            expected = 1
          if (abs(column - expected) > 0.001): is_identity = False

      if not is_identity:
        original_matrix = object.matrix_world.copy()
        object.matrix_parent_inverse.identity()
        object.matrix_basis = object.parent.matrix_world.inverted() * original_matrix

      exported = {
        "parent": object.parent.name if object.parent else None,
        "transform": {
          "scale": write_animation(object, object, "scale", 3, False),
          "rotation": write_animation(object, object, "rotation_euler", 3, False),
          "translation": write_animation(object, object, "location", 3, False)
        }
      }

      if not exported["transform"]["scale"]: return {"FINISHED"}
      if not exported["transform"]["rotation"]: return {"FINISHED"}
      if not exported["transform"]["translation"]: return {"FINISHED"}

      scene_nodes[object.name] = exported

      if object.type == "EMPTY":
        pass
      elif object.type == "LAMP":
        exported["type"] = "light"
        exported["data"] = object.data.name
        if object.data.name not in lights:
          data = {
            "color": write_animation(object, object.data, "color", 3, False)
          }

          if not data["color"]: return {"FINISHED"}

          if object.data.type == "POINT":
            if not object.data.use_sphere:
              self.report({"ERROR"}, "Object \"" + object.name + "\" is non-spherical, which is not supported.")
              return {"FINISHED"}
            if object.data.shadow_method != "NOSHADOW":
              self.report({"ERROR"}, "Object \"" + object.name + "\" has a shadow, which is not supported.")
              return {"FINISHED"}
            if object.data.falloff_type != "INVERSE_LINEAR":
              self.report({"ERROR"}, "Object \"" + object.name + "\" has a falloff type of \"" + object.data.falloff_type + "\", which is not supported (use Inverse Linear).")
              return {"FINISHED"}
            data["falloff"] = {
              "type": "sphere",
              "multiplier": write_animation(object, object.data, "energy", 1, False),
              "negative": write_animation(object, object.data, "use_negative", 1, True),
              "radius": write_animation(object, object.data, "distance", 1, False)
            }
            if not data["falloff"]["multiplier"]: return {"FINISHED"}
            if not data["falloff"]["negative"]: return {"FINISHED"}
            if not data["falloff"]["radius"]: return {"FINISHED"}
          elif object.data.type == "SPOT":
            if not object.data.use_sphere:
              self.report({"ERROR"}, "Object \"" + object.name + "\" is non-spherical, which is not supported.")
              return {"FINISHED"}
            if object.data.use_square:
              self.report({"ERROR"}, "Object \"" + object.name + "\" is a square, which is not supported.")
              return {"FINISHED"}
            if object.data.shadow_method != "NOSHADOW":
              self.report({"ERROR"}, "Object \"" + object.name + "\" has a shadow, which is not supported.")
              return {"FINISHED"}
            if object.data.falloff_type != "INVERSE_LINEAR":
              self.report({"ERROR"}, "Object \"" + object.name + "\" has a falloff type of \"" + object.data.falloff_type + "\", which is not supported (use Inverse Linear).")
              return {"FINISHED"}
            if object.data.spot_blend != 1:
              self.report({"ERROR"}, "Object \"" + object.name + "\" has a spot blend other than 1.")
              return {"FINISHED"}
            data["falloff"] = {
              "type": "cone",
              "multiplier": write_animation(object, object.data, "energy", 1, False),
              "negative": write_animation(object, object.data, "use_negative", 1, True),
              "radius": write_animation(object, object.data, "distance", 1, False),
              "spotSize": write_animation(object, object.data, "spot_size", 1, False)
            }
            if not data["falloff"]["multiplier"]: return {"FINISHED"}
            if not data["falloff"]["negative"]: return {"FINISHED"}
            if not data["falloff"]["radius"]: return {"FINISHED"}
            if not data["falloff"]["spotSize"]: return {"FINISHED"}
          else:
            self.report({"ERROR"}, "Object \"" + object.name + "\" is a lamp of type \"" + object.type + "\", which is not supported.")
            return {"FINISHED"}
          lights[object.data.name] = data
      elif object.type == "MESH":
        exported["type"] = "mesh"
        exported["data"] = object.data.name
        if object.data.name not in meshes:
          locations = []
          polygons = []
          for polygon in object.data.polygons:
            material = object.data.materials[polygon.material_index] if object.data.materials else None
            if material == None:
              self.report({"ERROR"}, "Object \"" + object.name + "\" contains faces without materials, which is not supported.")
              return {"FINISHED"}
            indices = []
            for index in polygon.vertices:
              location = [
                object.data.vertices[index].co[0],
                object.data.vertices[index].co[1],
                object.data.vertices[index].co[2]
              ]
              if location not in locations: locations.append(location)
              indices.append(locations.index(location))
            polygons.append({
              "material": material.name,
              "indices": indices
            })
          meshes[object.data.name] = {
            "locations": locations,
            "polygons": polygons
          }
      else:
        self.report({"ERROR"}, "Object \"" + object.name + "\" is a(n) \"" + object.type + "\", which is not a supported type.")
        return {"FINISHED"}

    json_string = json.dumps({
      "framesPerSecond": {
        "numerator": bpy.context.scene.render.fps,
        "denominator": bpy.context.scene.render.fps_base
      },
      "data": {
        "materials": materials,
        "meshes": meshes,
        "lights": lights
      },
      "sceneNodes": scene_nodes
    }, indent=4, sort_keys=True)
    file = open(self.properties.filepath, "w")
    file.write(json_string)
    file.close()
    return {"FINISHED"}

def import_menu_func(self, context):
  self.layout.operator(ImportCelluloidSceneFile.bl_idname)

def export_menu_func(self, context):
  self.layout.operator(ExportCelluloidSceneFile.bl_idname)

class AddCelluloidLamp(bpy.types.Operator):
  bl_idname = "celluloid.lamp_add"
  bl_label = "Add Celluloid Lamp"

  def execute(self, context):
    bpy.ops.object.lamp_add(type="SPOT")
    lamp = bpy.context.selected_objects[0]
    lamp.data.use_square = True
    lamp.data.spot_blend = 0
    lamp.data.falloff_type = "CONSTANT"
    lamp.data.use_specular = False
    lamp.data.shadow_buffer_type = "REGULAR"
    lamp.data.shadow_buffer_samples = 1
    return {"FINISHED"}

def register():
  bpy.utils.register_class(CelluloidPanel)
  bpy.utils.register_class(SetupCelluloidScene)
  bpy.utils.register_class(AddCelluloidLamp)
  bpy.utils.register_class(ImportCelluloidSceneFile)
  bpy.utils.register_class(ExportCelluloidSceneFile)
  bpy.types.INFO_MT_file_import.append(import_menu_func)
  bpy.types.INFO_MT_file_export.append(export_menu_func)

def unregister():
  bpy.utils.unregister_class(CelluloidPanel)
  bpy.utils.unregister_class(SetupCelluloidScene)
  bpy.utils.unregister_class(AddCelluloidLamp)
  bpy.utils.unregister_class(ImportCelluloidSceneFile)
  bpy.utils.unregister_class(ExportCelluloidSceneFile)
  bpy.types.INFO_MT_file_import.remove(import_menu_func)
  bpy.types.INFO_MT_file_export.remove(export_menu_func)

if __name__ == "__main__":
  register()