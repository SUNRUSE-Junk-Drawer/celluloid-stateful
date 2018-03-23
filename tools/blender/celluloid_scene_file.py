bl_info = {
  "name": "Celluloid Scene File",
  "category": "Import-Export"
}

import bpy, bpy_extras, json, bmesh, struct, math

def initialize_material(material):
  material.diffuse_shader = "TOON"
  material.diffuse_toon_size = math.pi
  material.diffuse_toon_smooth = 0
  material.specular_intensity = 0

def initialize_lamp(lamp):
  lamp.data.type = "SPOT"
  initialize_lamp_data(lamp.data)

def initialize_lamp_data(lamp_data):
  lamp_data.use_square = True
  lamp_data.spot_blend = 0
  lamp_data.falloff_type = "CONSTANT"
  lamp_data.use_specular = False
  lamp_data.shadow_method = "BUFFER_SHADOW"
  lamp_data.shadow_buffer_type = "REGULAR"
  lamp_data.shadow_buffer_samples = 1
  lamp_data.distance = 99999

def initialize_camera_data(camera_data):
  camera_data.show_limits = True
  camera_data.lens_unit = "FOV"

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
  """Configure a new scene for Celluloid"""
  bl_idname = "celluloid.setup_scene"
  bl_label = "Setup Celluloid Scene"

  def execute(self, context):
    bpy.context.scene.unit_settings.system = "METRIC"
    bpy.context.scene.unit_settings.scale_length = 1
    bpy.context.scene.render.use_edge_enhance = True
    bpy.context.space_data.show_backface_culling = True;
    for material in bpy.data.materials:
        initialize_material(material)
    for object in bpy.context.scene.objects:
      if object.type == "LAMP" and object.name != "ambient_light":
        initialize_lamp(object)
      elif object.type == "CAMERA":
        initialize_camera_data(object.data)

    if "ambient_light" not in bpy.context.scene.objects:
      ambient_light_data = bpy.data.lamps.new(name="ambient_light", type="SUN")
      ambient_light_data.energy = 0
      ambient_light = bpy.data.objects.new("ambient_light", ambient_light_data)
      ambient_light.animation_data_create()
      ambient_light.animation_data.action = bpy.data.actions.new(name="")
      ambient_light.rotation_euler[0] = 1
      ambient_light.rotation_euler[1] = 1
      ambient_light.rotation_euler[2] = 1
      bpy.context.scene.objects.link(ambient_light)

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

    ambient_light = bpy.context.scene.objects["ambient_light"]
    read_animation(json_object["ambientLight"]["color"], ambient_light.data, "color", False)
    read_animation(json_object["ambientLight"]["energy"], ambient_light.data, "energy", False)

    allData = {
      "material": {},
      "mesh": {},
      "lamp": {},
      "camera": {}
    }

    for material_name, material in json_object["data"]["materials"].items():
      created = bpy.data.materials.new(name=material_name)
      created.animation_data_create()
      created.animation_data.action = bpy.data.actions.new(name="")

      read_animation(material["diffuseColor"], created, "diffuse_color", False)
      read_animation(material["diffuseIntensity"], created, "diffuse_intensity", False)
      read_animation(material["emit"], created, "emit", False)
      read_animation(material["useShadeless"], created, "use_shadeless", True)
      read_animation(material["useShadows"], created, "use_shadows", True)
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

    for lamp_name, lamp in json_object["data"]["lamps"].items():
      created = bpy.data.lamps.new(name=lamp_name, type="SPOT")
      initialize_lamp_data(created)
      created.animation_data_create()
      created.animation_data.action = bpy.data.actions.new(name="")
      read_animation(lamp["color"], created, "color", False)
      read_animation(lamp["energy"], created, "energy", False)
      read_animation(lamp["spotSize"], created, "spot_size", False)
      created.shadow_buffer_size = lamp["shadowBufferSize"]
      read_animation(lamp["shadowBufferClipStart"], created, "shadow_buffer_clip_start", False)
      read_animation(lamp["shadowBufferClipEnd"], created, "shadow_buffer_clip_end", False)
      allData["lamp"][lamp_name] = created

    for camera_name, camera in json_object["data"]["cameras"].items():
      created = bpy.data.cameras.new(name=camera_name)
      initialize_camera_data(created)
      created.animation_data_create()
      created.animation_data.action = bpy.data.actions.new(name="")
      read_animation(camera["clipStart"], created, "clip_start", False)
      read_animation(camera["clipEnd"], created, "clip_end", False)
      read_animation(camera["angle"], created, "angle", False)
      allData["camera"][camera_name] = created

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
        read_animation(object["hide"], created, "hide", True)
        read_animation(object["hideRender"], created, "hide_render", True)
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
    lamps = {}
    cameras = {}

    bpy.ops.celluloid.setup_scene()

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
        "useShadows": write_animation(material, material, "use_shadows", 1, True),
        "useCastShadows": write_animation(material, material, "use_cast_shadows", 1, True),
        "useCastShadowsOnly": write_animation(material, material, "use_cast_shadows_only", 1, True)
      }

      if not materials[material_name]["diffuseColor"]: return {"FINISHED"}
      if not materials[material_name]["diffuseIntensity"]: return {"FINISHED"}
      if not materials[material_name]["emit"]: return {"FINISHED"}
      if not materials[material_name]["useShadeless"]: return {"FINISHED"}
      if not materials[material_name]["useShadows"]: return {"FINISHED"}
      if not materials[material_name]["useCastShadows"]: return {"FINISHED"}
      if not materials[material_name]["useCastShadowsOnly"]: return {"FINISHED"}

    for object in bpy.context.scene.objects:
      if object.name == "ambient_light": continue

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
        },
        "hide": write_animation(object, object, "hide", 1, True),
        "hideRender": write_animation(object, object, "hide_render", 1, True)
      }

      if not exported["transform"]["scale"]: return {"FINISHED"}
      if not exported["transform"]["rotation"]: return {"FINISHED"}
      if not exported["transform"]["translation"]: return {"FINISHED"}
      if not exported["hide"]: return {"FINISHED"}
      if not exported["hideRender"]: return {"FINISHED"}

      scene_nodes[object.name] = exported

      if object.type == "EMPTY":
        pass
      elif object.type == "LAMP":
        exported["type"] = "lamp"
        exported["data"] = object.data.name
        if object.data.name not in lamps:
          data = {
            "color": write_animation(object, object.data, "color", 3, False),
            "energy": write_animation(object, object.data, "energy", 1, False),
            "spotSize": write_animation(object, object.data, "spot_size", 1, False),
            "shadowBufferSize": object.data.shadow_buffer_size,
            "shadowBufferClipStart": write_animation(object, object.data, "shadow_buffer_clip_start", 1, False),
            "shadowBufferClipEnd": write_animation(object, object.data, "shadow_buffer_clip_end", 1, False)
          }
          if not data["energy"]: return {"FINISHED"}
          if not data["spotSize"]: return {"FINISHED"}
          if not data["shadowBufferClipStart"]: return {"FINISHED"}
          if not data["shadowBufferClipEnd"]: return {"FINISHED"}

          lamps[object.data.name] = data
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
      elif object.type == "CAMERA":
        exported["type"] = "camera"
        exported["data"] = object.data.name
        if object.data.name not in cameras:
          data = {
            "clipStart": write_animation(object, object.data, "clip_start", 1, False),
            "clipEnd": write_animation(object, object.data, "clip_end", 1, False),
            "angle": write_animation(object, object.data, "angle", 1, False)
          }
          if not data["clipStart"]: return {"FINISHED"}
          if not data["clipEnd"]: return {"FINISHED"}
          if not data["angle"]: return {"FINISHED"}
          cameras[object.data.name] = data
      else:
        self.report({"ERROR"}, "Object \"" + object.name + "\" is a(n) \"" + object.type + "\", which is not a supported type.")
        return {"FINISHED"}

    ambient_light = bpy.context.scene.objects["ambient_light"]

    json_object = {
      "framesPerSecond": {
        "numerator": bpy.context.scene.render.fps,
        "denominator": bpy.context.scene.render.fps_base
      },
      "ambientLight": {
        "color": write_animation(ambient_light, ambient_light.data, "color", 3, False),
        "energy": write_animation(ambient_light, ambient_light.data, "energy", 1, False)
      },
      "data": {
        "materials": materials,
        "meshes": meshes,
        "lamps": lamps,
        "cameras": cameras
      },
      "sceneNodes": scene_nodes
    }
    if not json_object["ambientLight"]["color"]: return {"FINISHED"}
    if not json_object["ambientLight"]["energy"]: return {"FINISHED"}

    json_string = json.dumps(json_object, indent=4, sort_keys=True)

    material_names_in_order = list(materials.keys())
    mesh_names_in_order = list(meshes.keys())
    lamp_names_in_order = list(lamps.keys())
    camera_names_in_order = list(cameras.keys())
    
    scene_node_names_in_order = []
    for scene_node_name in scene_nodes:
      scene_node = scene_nodes[scene_node_name]
      if scene_node["parent"] != None: continue
      scene_node_names_in_order.append(scene_node_name)

    while len(scene_node_names_in_order) < len(scene_nodes):
      for scene_node_name in scene_nodes:
        if scene_node_name in scene_node_names_in_order: continue
        scene_node = scene_nodes[scene_node_name]
        if scene_node["parent"] not in scene_node_names_in_order: continue
        scene_node_names_in_order.append(scene_node_name)

    binary_string = {"":b""}

    def write_utf8(value):
      binary_string[""] += value.encode("utf8")
      write_uint8(0)

    def write_uint8(value):
      binary_string[""] += struct.pack("<B", value)
            
    def write_uint16(value):
      binary_string[""] += struct.pack("<H", value)
        
    def write_float32(value):
      binary_string[""] += struct.pack("<f", value)

    def write_boolean_animation(value):
      if len(value) == 1:
        write_uint16(0)
        write_uint8(1 if value[0]["withValue"] else 0)
      else:
        write_uint16(len(value))
        for keyframe in value:
          write_float32(keyframe["startsOnFrame"])
          write_uint8(1 if keyframe["withValue"] else 0)

    def write_number_animation(value):
      if len(value) == 1:
        write_uint16(0)
        write_float32(value[0]["withValue"])
      else:
        write_uint16(len(value))
        for keyframe in value:
          write_float32(keyframe["startsOnFrame"])
          write_uint8(1 if keyframe["type"] == "linear" else 0)
          write_float32(keyframe["withValue"])

    for channel in json_object["ambientLight"]["color"]:
      write_number_animation(channel)
    write_number_animation(json_object["ambientLight"]["energy"])

    write_uint16(len(material_names_in_order))
    for material_name in material_names_in_order:
      write_utf8(material_name)
      for channel in materials[material_name]["diffuseColor"]:
        write_number_animation(channel)
      write_number_animation(materials[material_name]["diffuseIntensity"])
      write_number_animation(materials[material_name]["emit"])
      write_boolean_animation(materials[material_name]["useShadeless"])
      write_boolean_animation(materials[material_name]["useShadows"])
      write_boolean_animation(materials[material_name]["useCastShadows"])
      write_boolean_animation(materials[material_name]["useCastShadowsOnly"])

    write_uint16(len(mesh_names_in_order))
    for mesh_name in mesh_names_in_order:
      write_utf8(mesh_name)

      write_uint16(len(meshes[mesh_name]["locations"]))
      for location in meshes[mesh_name]["locations"]:
        for axis in location:
          write_float32(axis)

      ordered_mesh_material_names = []
      indices_by_material_name = {}
      for polygon in meshes[mesh_name]["polygons"]:
        material_name = polygon["material"]
        if material_name not in ordered_mesh_material_names:
          ordered_mesh_material_names.append(material_name)
          indices_by_material_name[material_name] = []
        
        indices = polygon["indices"]
        for i in range(0, len(indices) - 2):
          indices_by_material_name[material_name].append([
            indices[0],
            indices[i + 1],
            indices[i + 2]
          ])
      
      write_uint8(len(ordered_mesh_material_names))

      for material_name in ordered_mesh_material_names:
        write_uint16(material_names_in_order.index(material_name))
        write_uint16(len(indices_by_material_name[material_name]))
        for indices in indices_by_material_name[material_name]:
          for index in indices:
            write_uint16(index)

    write_uint16(len(lamp_names_in_order))
    for lamp_name in lamp_names_in_order:
      write_utf8(lamp_name)
      lamp = lamps[lamp_name]
      for channel in lamp["color"]:
        write_number_animation(channel)
      write_number_animation(lamp["energy"])
      write_number_animation(lamp["spotSize"])
      write_uint16(lamp["shadowBufferSize"])
      write_number_animation(lamp["shadowBufferClipStart"])
      write_number_animation(lamp["shadowBufferClipEnd"])

    write_uint16(len(camera_names_in_order))
    for camera_name in camera_names_in_order:
      write_utf8(camera_name)
      camera = cameras[camera_name]
      write_number_animation(camera["clipStart"])
      write_number_animation(camera["clipEnd"])
      write_number_animation(camera["angle"])

    write_uint16(len(scene_node_names_in_order))
    for scene_node_name in scene_node_names_in_order:
      write_utf8(scene_node_name)
      scene_node = scene_nodes[scene_node_name]
      if "type" not in scene_node:
        write_uint8(0)
      elif scene_node["type"] == "mesh":
        write_uint8(1)
      elif scene_node["type"] == "lamp":
        write_uint8(2)
      elif scene_node["type"] == "camera":
        write_uint8(3)
      write_uint16(scene_node_names_in_order.index(scene_node["parent"]) if scene_node["parent"] != None else 65535)
      for axis in scene_node["transform"]["translation"]:
        write_number_animation(axis)
      for axis in scene_node["transform"]["scale"]:
        write_number_animation(axis)
      for axis in scene_node["transform"]["rotation"]:
        write_number_animation(axis)
      write_boolean_animation(scene_node["hideRender"])
      if "type" in scene_node:
        if scene_node["type"] == "mesh":
          write_uint16(mesh_names_in_order.index(scene_node["data"]))
        elif scene_node["type"] == "lamp":
          write_uint16(lamp_names_in_order.index(scene_node["data"]))
        elif scene_node["type"] == "camera":
          write_uint16(camera_names_in_order.index(scene_node["data"]))

    binary_filepath = self.properties.filepath
    if binary_filepath.endswith(".json"):
      binary_filepath = binary_filepath[:-5]
    binary_filepath += ".bin"

    file = open(self.properties.filepath, "w")
    file.write(json_string)
    file.close()

    file = open(binary_filepath, "wb")
    file.write(binary_string[""])
    file.close()

    return {"FINISHED"}

def import_menu_func(self, context):
  self.layout.operator(ImportCelluloidSceneFile.bl_idname)

def export_menu_func(self, context):
  self.layout.operator(ExportCelluloidSceneFile.bl_idname)

class AddCelluloidLamp(bpy.types.Operator):
  """Create a new Lamp which is set up for Celluloid"""
  bl_idname = "celluloid.lamp_add"
  bl_label = "Add Celluloid Lamp"

  def execute(self, context):
    bpy.ops.object.lamp_add(type="SPOT")
    initialize_lamp_data(bpy.context.selected_objects[0].data)
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