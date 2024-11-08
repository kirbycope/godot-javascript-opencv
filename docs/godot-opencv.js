let capture = null;
let classifier = null;
let frame = null;
let inputElement = null;
let outputElement = null;
const FPS = 30;

/** Runs once the script has been added to the DOM. */
function beginStreaming() {

    // Check if the <video> element has been set
    if (!inputElement) {
        // Create the <video> element exists
        inputElement = document.createElement('video');
        inputElement.id = "videoInput";
        inputElement.height = 480;
        inputElement.width = 640;
        inputElement.style.display = 'none';
        document.body.appendChild(inputElement);
    }

    // Check if the canvas element has been set
    if (!outputElement) {
        // Create the <canvas> element and container
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '50%';
        container.style.left = '50%';
        container.style.transform = 'translate(-50%, -50%)';
        container.style.zIndex = '1000'; // Make sure it's above other elements

        outputElement = document.createElement('canvas');
        outputElement.id = "videoOutput";
        outputElement.height = 480;
        outputElement.width = 640;
        outputElement.style.opacity = '0.5'; // Set 50% opacity
        
        container.appendChild(outputElement);
        document.body.appendChild(container);
    }

    // Request webcam access
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(function(stream) {
            inputElement.srcObject = stream;
            inputElement.play();

            // Wait for the video to be ready
            inputElement.onloadedmetadata = function() {
                // Initialize video capture
                capture = new cv.VideoCapture(inputElement);

                // Load the pre-trained classifier
                classifier = new cv.CascadeClassifier();
                
                // Create utility class to load classifier file
                let utils = new Utils('');
                utils.createFileFromUrl('haarcascade_frontalface_default.xml', 
                    'haarcascade_frontalface_default.xml', 
                    () => {
                        classifier.load('haarcascade_frontalface_default.xml');
                        
                        // Create frame Mat
                        frame = new cv.Mat(inputElement.height, inputElement.width, cv.CV_8UC4);
                        
                        // Start processing
                        processVideo();
                    });
            };
        })
        .catch(function(err) {
            console.error("Error accessing webcam:", err);
        });
}

/** Processes the webcam video every frame. */
function processVideo() {
    try {
        let begin = Date.now();

        // Create Mats for processing
        let gray = new cv.Mat();
        let faces = new cv.RectVector();
        
        // Capture frame
        capture.read(frame);
        
        // Convert to grayscale
        cv.cvtColor(frame, gray, cv.COLOR_RGBA2GRAY);
        
        // Detect faces
        classifier.detectMultiScale(gray, faces, 1.1, 3, 0);
        
        // Draw rectangles around detected faces
        for (let i = 0; i < faces.size(); ++i) {
            let face = faces.get(i);
            let point1 = new cv.Point(face.x, face.y);
            let point2 = new cv.Point(face.x + face.width, face.y + face.height);
            cv.rectangle(frame, point1, point2, [255, 0, 0, 255], 2);
        }

        // Show result
        cv.imshow('videoOutput', frame);

        // Clean up
        gray.delete();
        faces.delete();

        // Schedule next frame
        let delay = 1000/FPS - (Date.now() - begin);
        setTimeout(processVideo, Math.max(0, delay));
    } catch(err) {
        console.error("Error in processVideo:", err);
    }
}

// Utils class for loading cascade file
class Utils {
    constructor(path) {
        this.path = path;
    }

    createFileFromUrl(path, url, callback) {
        let request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.onload = function(ev) {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    let data = new Uint8Array(request.response);
                    cv.FS_createDataFile('/', path, data, true, false, false);
                    callback();
                } else {
                    console.error('Failed to load ' + url + ' status: ' + request.status);
                }
            }
        };
        request.send();
    }
}
