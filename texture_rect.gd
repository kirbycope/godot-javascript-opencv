extends TextureRect

var cv: JavaScriptObject

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	pass

	# Retrieve the `window.console` object.
	#var console = JavaScriptBridge.get_interface("console")
	# Call the `window.console.log()` method.
	#console.log("test")

	# https://docs.godotengine.org/en/stable/tutorials/platform/web/javascript_bridge.html#can-i-use-my-favorite-library
	#if cv == null:
	#	cv = JavaScriptBridge.get_interface("cv")
	#JavaScriptBridge.eval('console.log(typeof cv !== "undefined" ? "OpenCV.js is loaded" : "OpenCV.js is not loaded");')

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	pass
