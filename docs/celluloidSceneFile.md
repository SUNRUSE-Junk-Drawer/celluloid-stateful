# Celluloid Scene File

A scene file is a JSON document describing a scene graph which can be rendered
using Celluloid.  It is intended to be source controllable and able to 
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

If an animation's first frame is after frame 0, it will wait that many frames
before starting its first loop.

#### Boolean

##### Keyframe

The property holds a value until the next value.

```json
{
	"startsOnFrame": 0,
	"withValue": "any JSON"
}
```

#### Number

##### Keyframes

###### Constant

The property holds a value until the next value.

```json
{
	"type": "constant",
	"startsOnFrame": 0,
	"withValue": "any JSON"
}
```

###### Linear

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
	"multiplier": "any number animation",
	"negative": "any boolean animation",
	"radius": "any number animation"
}
```

#### Cone

The effect is a conical section of a sphere, linearly falling off to zero from
the origin and away from the "spot" towards -Z.

```
{
	"type": "cone",
	"multiplier": "any number animation",
	"negative": "any boolean animation",
	"radius": "any number animation",
	"spotSize": "any angle number animation"
}
```

### Scene

```json
{
	"framesPerSecond": {
		"numerator": "any number",
		"denominator": "any number"
	},
	
	"data": {
		"materials": "any named collection of materials",
		"meshes": "any named collection of meshes",
		"lights": "any named collection of lights"
	},
	"sceneNodes": "any named collection of scene nodes"
}
```

#### Data

##### Material

Describes a material which is applicable to polygons of meshes.

```json
{
	"diffuseColor": [
		"any red number animation",
		"any green number animation",
		"any blue number animation"
	],
	"diffuseIntensity": "any number animation",
	"emit": "any number animation",
	"useShadeless": "any boolean animation",
	"useShadows": "any boolean animation",
	"useCastShadows": "any boolean animation",
	"useCastShadowsOnly": "any boolean animation"
}
```

##### Mesh

Describes a "polygon soup".

```json
{
	"locations": [
		["x number", "y number", "z number"],
		["x number", "y number", "z number"],
		["x number", "y number", "z number"]
	],
	"polygons": "any array of polygons"
}
```

###### Polygon

```json
{
	"material": "any key of scene.data.material",
	"indices": "any array of numeric indices into the locations array"
}
```

##### Light

```json
{
	"color": [
		"any red number animation",
		"any green number animation",
		"any blue number animation"
	],
	"falloff": "any falloff"
}
```

#### Scene Node

##### Empty

```json
{
	"parent": "any key of scene.sceneNodes, or null if none",
	"transform": "any transform",
	"hide": "any boolean animation",
	"hideRender": "any boolean animation"
}
```

##### Non-Empty

```json
{
	"parent": "any key of scene.sceneNodes, or null if none",
	"type": "any key of scene.data",
	"transform": "any transform",
	"data": "any key of scene.data[type]",
	"hide": "any boolean animation",
	"hideRender": "any boolean animation"
}
```