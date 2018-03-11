# Celluloid Scene File (BIN)

A binary scene file mirroring the contents of a JSON Celluloid Scene File, but
better packed.

## Animation

### Boolean

Boolean 

- A uint16 specifying how many keyframes there are.

If there are zero keyframes:
- A uint8, where 1 represents true, and 0 represents false.

Otherwise, for each keyframe, in frame order:
- A float32 specifying which frame the keyframe falls on.
- A uint8, where 1 represents true, and 0 represents false.

### Number

- A uint16 specifying how many keyframes there are.

If there are zero keyframes:
- A float32 specifying the constant value to use.

Otherwise, for each keyframe, in frame order:
- A float32 specifying which frame the keyframe falls on.
- A uint8 specifying the type of keyframe.

#### 0 - Constant

- A float32 specifying the value throughout the keyframe.

#### 1 - Linear

- A float32 specifying the value at the start of the keyframe.

## Scene

- A uint16 specifying how many material data object there are.

For each material data object:
- A UTF-8, zero-terminated string specifying its name.
- 3 number animations specifying the red, green and blue color.
- A number animation specifying the diffuse intensity.
- A number animation specifying the emissive strength.
- A boolean animation specifying whether to skip lighting entirely.
- A boolean animation specifying whether to accept shadows.
- A boolean animation specifying whether to cast shadows.
- A boolean animation specifying whether to only cast shadows.

- A uint16 specifying how many mesh data objects there are.

For each mesh data object:
- A UTF-8, zero-terminated string specifying its name.
- A uint16 specifying how many locations there are.

For each location:
- 3 float32s specifying the X, Y and Z coordinates of the location.

- A uint8 specifying how many materials there are.

For each material:

- A uint16 specifying which material data object to use.
- A uint16 specifyihg how many triangles there are.

For each triangle:

- 3 uint16s specifying the location indices of the triangle.

- A uint16 specifying how many lamp data objects there are.

For each lamp data object:
- A UTF-8, zero-terminated string specifying its name.
- 3 number animations specifying the red, green and blue color.
- A number animation specifying the energy.
- A number animation specifying the distance.
- A number animation specifying the spot size.
- A uint16 specifying the shadow buffer size.

- A uint16 specifying how many camera data objects there are.

For each camera data object:
- A UTF-8, zero-terminated string specifying its name.
- A number animation specifying the clip start.
- A number animation specifying the clip end.
- A number animation specifying the lens.

- A uint16 specifying how many scene nodes there are.

For each scene node, pre-sorted so that parents precede their children:
- A UTF-8, zero-terminated string specifying its name.
- A uint8 specifying the type of scene node.

## Scene Node

### 0 - Empty

- A uint16 specifying the parent scene node, if any, else, 65535.
- 3 number animations specifying the translation on X, Y and Z.
- 3 number animations specifying the scale on X, Y and Z.
- 3 number animations specifying the rotation on X, Y and Z.
- A boolean animation specifying whether to hide any child scene nodes.

### 1 - Mesh

- A uint16 specifying the parent scene node, if any, else, 65535.
- 3 number animations specifying the translation on X, Y and Z.
- 3 number animations specifying the scale on X, Y and Z.
- 3 number animations specifying the rotation on X, Y and Z.
- A boolean animation specifying whether to hide the mesh and any child scene nodes.
- A uint16 specifying the mesh data object to use.

### 2 - Lamp

- A uint16 specifying the parent scene node, if any, else, 65535.
- 3 number animations specifying the translation on X, Y and Z.
- 3 number animations specifying the scale on X, Y and Z.
- 3 number animations specifying the rotation on X, Y and Z.
- A boolean animation specifying whether to hide the lamp and any child scene nodes.
- A uint16 specifying the lamp data object to use.

### 3 - Camera

- A uint16 specifying the parent scene node, if any, else, 65535.
- 3 number animations specifying the translation on X, Y and Z.
- 3 number animations specifying the scale on X, Y and Z.
- 3 number animations specifying the rotation on X, Y and Z.
- A boolean animation specifying whether to hide any child scene nodes.
- A uint16 specifying the camera data object to use.