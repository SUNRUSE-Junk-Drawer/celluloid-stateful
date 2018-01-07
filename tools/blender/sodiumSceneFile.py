bl_info = {
    "name": "Sodium Scene File",
    "category": "Import-Export"
}

import bpy, bpy_extras, json

class ImportSodiumSceneFile(bpy.types.Operator, bpy_extras.io_utils.ImportHelper):
    """Import Sodium Scene File"""
    bl_idname = "import.sodiumscenefile"
    bl_label = "Import Sodium Scene File (*.json)"

    filename_ext = ".json"

    def execute(self, context):
        file = open(self.properties.filepath, "r")
        json_string = file.read()
        file.close()
        json_object = json.loads(json_string)
        bpy.context.scene.render.fps = json_object["framesPerSecond"]["numerator"]
        bpy.context.scene.render.fps_base = json_object["framesPerSecond"]["denominator"]
        return {"FINISHED"}

class ExportSodiumSceneFile(bpy.types.Operator, bpy_extras.io_utils.ExportHelper):
    """Export Sodium Scene File"""
    bl_idname = "export.sodiumscenefile"
    bl_label = "Export Sodium Scene File (*.json)"

    filename_ext = ".json"

    def execute(self, context):
        scene_nodes = {}

        def write_animation(object, data_object, property_name, axes):
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
                            exported = {
                                "startsOnFrame": keyframe.co[0],
                                "withValue": keyframe.co[1]
                            }
                            if keyframe.interpolation == "CONSTANT": exported["type"] = "constant"
                            elif keyframe.interpolation == "LINEAR": exported["type"] = "linear"
                            else: 
                                self.report({"ERROR"}, "Object \"" + object.name + "\" contains unexpected interpolation type \"" + keyframe.interpolation + "\".")
                                return False
                            keyframes.append(exported)

                        output.append(keyframes)

                        found = True
                        break

                if not found: output.append([{
                    "type": "constant",
                    "startsOnFrame": 0,
                    "withValue": fallback[axis]
                }])

            return output

        for root_object in bpy.context.scene.objects:
            if root_object.parent: continue
            def recurse(object, collection):
                exported = {
                    "transform": {
                        "scale": write_animation(object, object, "scale", 3),
                        "rotation": write_animation(object, object, "rotation_euler", 3),
                        "translation": write_animation(object, object, "location", 3)
                    },
                    "children": {}
                }

                if not exported["transform"]["scale"]: return False
                if not exported["transform"]["rotation"]: return False
                if not exported["transform"]["translation"]: return False

                collection[object.name] = exported

                if object.type == "EMPTY":
                    exported["type"] = "empty"
                elif object.type == "LAMP":
                    exported["type"] = "light"
                    exported["color"] = write_animation(object, object.data, "color", 3)
                    if object.data.type == "POINT":
                        if not object.data.use_sphere:
                            self.report({"ERROR"}, "Object \"" + object.name + "\" is non-spherical, which is not supported.")
                            return False
                        if object.data.shadow_method != "NOSHADOW":
                            self.report({"ERROR"}, "Object \"" + object.name + "\" has a shadow, which is not supported.")
                            return False
                        if object.data.falloff_type != "INVERSE_LINEAR":
                            self.report({"ERROR"}, "Object \"" + object.name + "\" has a falloff type of \"" + object.data.falloff_type + "\", which is not supported (use Inverse Linear).")
                            return False
                        exported["falloff"] = {
                            "type": "sphere",
                            "radius": write_animation(object, object.data, "distance", 1)
                        }
                    elif object.data.type == "SPOT":
                        if not object.data.use_sphere:
                            self.report({"ERROR"}, "Object \"" + object.name + "\" is non-spherical, which is not supported.")
                            return False
                        if object.data.use_square:
                            self.report({"ERROR"}, "Object \"" + object.name + "\" is a square, which is not supported.")
                            return False
                        if object.data.shadow_method != "NOSHADOW":
                            self.report({"ERROR"}, "Object \"" + object.name + "\" has a shadow, which is not supported.")
                            return False
                        if object.data.falloff_type != "INVERSE_LINEAR":
                            self.report({"ERROR"}, "Object \"" + object.name + "\" has a falloff type of \"" + object.data.falloff_type + "\", which is not supported (use Inverse Linear).")
                            return False
                        if object.data.spot_blend != 1:
                            self.report({"ERROR"}, "Object \"" + object.name + "\" has a spot blend other than 1.")
                            return False
                        exported["falloff"] = {
                            "type": "cone",
                            "radius": write_animation(object, object.data, "distance", 1),
                            "spotSize": write_animation(object, object.data, "spot_size", 1)
                        }
                    else:
                        self.report({"ERROR"}, "Object \"" + object.name + "\" is a lamp of type \"" + object.type + "\", which is not supported.")
                        return False
                    if not exported["color"]: return False
                elif object.type == "MESH":
                    exported["type"] = "mesh"
                    exported["mesh"] = object.data.name
                else:
                    self.report({"ERROR"}, "Object \"" + object.name + "\" is a(n) \"" + object.type + "\", which is not a supported type.")
                    return False
                if object.children:
                    for child in object.children: 
                        if not recurse(child, exported["children"]): return False
                return True
            if not recurse(root_object, scene_nodes): return {"FINISHED"}

        json_string = json.dumps({
            "framesPerSecond": {
                "numerator": bpy.context.scene.render.fps,
                "denominator": bpy.context.scene.render.fps_base
            },
            "sceneNodes": scene_nodes
        }, indent=4, sort_keys=True)
        file = open(self.properties.filepath, "w")
        file.write(json_string)
        file.close()
        return {"FINISHED"}

def import_menu_func(self, context):
    self.layout.operator(ImportSodiumSceneFile.bl_idname)

def export_menu_func(self, context):
    self.layout.operator(ExportSodiumSceneFile.bl_idname)

def register():
    bpy.utils.register_class(ImportSodiumSceneFile)
    bpy.utils.register_class(ExportSodiumSceneFile)
    bpy.types.INFO_MT_file_import.append(import_menu_func)
    bpy.types.INFO_MT_file_export.append(export_menu_func)

def unregister():
    bpy.utils.unregister_class(ImportSodiumSceneFile)
    bpy.utils.unregister_class(ExportSodiumSceneFile)
    bpy.types.INFO_MT_file_import.remove(import_menu_func)
    bpy.types.INFO_MT_file_export.remove(export_menu_func)

if __name__ == "__main__":
    register()