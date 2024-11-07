// load pre-trained classifiers
let classifier = new cv.CascadeClassifier();
classifier.load('haarcascade_frontalface_default.xml');

const FPS = 30;
let src = new cv.Mat(480, 640, cv.CV_8UC4);

function onOpenCvReady() {

	//let video = document.getElementById('videoInput');
	// Create a "video" element
	video = document.createElement('video');
	// Add the element to the DOM
	document.body.appendChild(video);

	// Process the video feed
	processVideo();
}

function processVideo() {
	print("processVideo()");
	cap.read(src);
}
