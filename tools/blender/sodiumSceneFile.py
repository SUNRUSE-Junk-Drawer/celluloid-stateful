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
        json_string = json.dumps({
            "framesPerSecond": {
                "numerator": bpy.context.scene.render.fps,
                "denominator": bpy.context.scene.render.fps_base
            }
        })
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