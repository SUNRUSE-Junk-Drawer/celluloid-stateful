# Sodium Scene File

A scene file is a JSON document describing a scene graph which can be rendered
using Sodium Engine.  It is intended to be source controllable and able to 
round-trip to Blender.

### Units

#### Space

All measurements of length are in meters.

#### Time

All measurements of time are in numbers of frames.

#### Color

All colors are RGB unit intervals.

#### Angle

All angles are in radians.

### Animation

Every property is an array of keyframe objects describing an animation.

Every scene node's animation loops when every property's animation reaches its 
end.

The first frame is inclusive, and the last frame is exclusive.

All animations in a scene follow the same frame counter, but can loop at 
different times.  For instance, given two objects with durations of 2 and 4 
frames, these would loop 6 and 3 times respectively in a 12 frame period.

#### Keyframes

##### Constant

The property holds a value until the next value.

```json
{
	"type": "constant",
	"startsOnFrame": 0,
	"withValue": "any JSON"
}
```

##### Linear

The property linearly ramps to the next value.

```json
{
	"type": "linear",
	"startsOnFrame": 0,
	"withValue": "any JSON"
}
```

### Named collection

An object mapping names to JSON objects.

These should be written to the file in alphabetical order, to ensure that the
contents do not reorder unexpectedly in source control comparisons.

```json
{
	"aName": "any JSON",
	"anotherName": "any JSON"
}
```

### Mesh

Describes a "polygon soup".

```json
{
	"locations": [
		["x number", "y number", "z number"],
		["x number", "y number", "z number"],
		["x number", "y number", "z number"]
	],
	"materials": "any named collection of arrays of arrays representing polygons of numeric indices into the locations array"
}
```

#### Materials

The following material names are supported:

##### occluder

Visible, blocking light, but not solid.

##### walk

Defines the surface on which the player can walk.

##### none

The polygon is not directly used.

### Transform

Describes how something is positioned relative to its parent.
These are applied in the order defined below.

```json
{
	"scale": [
		"any x number animation",
		"any y number animation",
		"any z number animation"
	],
	"rotation": [
		"any x number animation",
		"any y number animation",
		"any z number animation"
	],
	"translation": [
		"any x number animation",
		"any y number animation",
		"any z number animation"
	]
}
```

### Falloff

Describes the shape of an effect in the world.

#### Sphere

The effect is spherical, linearly falling off to zero from the origin.

```
{
	"type": "sphere",
	"radius": "any number animation"
}
```

#### Cone

The effect is a conical section of a sphere, linearly falling off to zero from
the origin and away from the "spot" towards -Z.

```
{
	"type": "cone",
	"radius": "any number animation",
	"size": "any angle number animation"
}
```

### Scene node

#### Empty

Does nothing itself, but can be used to organize other scene nodes.

```json
{
	"type": "empty",
	"transform": "any transform",
	"children": "any named collection of scene nodes"
}
```

#### Light

```json
{
	"type": "light",
	"color": [
		"any red number animation",
		"any green number animation",
		"any blue number animation"
	].
	"shape": "any falloff",
	"children": "any named collection of scene nodes"
}
```

#### Mesh

```json
{
	"type": "mesh",
	"shape": "any falloff",
	"children": "any named collection of scene nodes"
}
```

### Scene

```json
{
	"framesPerSecond": "any number",
	"meshes": "any named collection of meshes",
	"sceneNodes": "any named collection of scene nodes"
}
```