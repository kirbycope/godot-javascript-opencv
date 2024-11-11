extends TextureRect

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	JavaScriptBridge.eval("beginStreaming()")

# Called every frame. '_delta' is the elapsed time since the previous frame.
func _process(_delta: float) -> void:

	# Extract face coordinates
	var recievedData = JavaScriptBridge.eval("JSON.stringify(facesList || [])")
	var faces = JSON.parse_string(recievedData)
	if faces == null: JavaScriptBridge.eval("console.log('null faces')")  # DEBUGGING

	# Get the GodotPlush node
	var plush = get_node("../../../GodotPlush")
	if plush == null: JavaScriptBridge.eval("console.log('null plush')")  # DEBUGGING

	# Handle faces found
	if faces.size() > 0:

		# Only consider the first detected face
		var face = faces[0]
		var x = face["x"]
		var y = face["y"]
		var width = face["w"]
		var height = face["h"]

		# Calculate offsets from the center
		var image_center_x = 320
		var image_center_y = 240
		var offset_x = x + (width / 2) - image_center_x
		var offset_y = y + (height / 2) - image_center_y

		# Move the plush based on the offsets, scaling the movement correctly
		plush.position = Vector3(offset_x * 0.002, (-offset_y * 0.002)+0.08, 0.0)

	else:
		# If no faces are detected, return to the original position
		plush.position = Vector3(0.0, 0.0, 0.0)

	# Get canvas image data (removing data URL prefix)
	var base_64_string = JavaScriptBridge.eval("getCanvasImage()").split(",")[1]

	# Convert the Base64 string to raw data
	var raw_data = Marshalls.base64_to_raw(base_64_string)

	# Create an Image from the raw data
	var image = Image.new()

	# Load the image from memory
	var result = image.load_png_from_buffer(raw_data)

	# Check if the image loaded from the buffer
	if !result:

		# Create a new `ImageTexture` and initializes it by allocating and setting the data from an `Image`
		image = ImageTexture.create_from_image(image)

		# Set _this_ node's Texture2D resource
		texture = image
