let capture = null;
let classifier = null;
let container = null;
let facesList = [];
let frame = null;
let inputElement = null;
let outputElement = null;
const FPS = 30;

/** Runs once the script has been added to the DOM. */
async function beginStreaming() {

    // Create the <video> element
    inputElement = document.createElement('video');
    inputElement.id = "videoInput";
    inputElement.height = 480;
    inputElement.width = 640;
    inputElement.style.display = 'none';
    document.body.appendChild(inputElement);

    // Create the <div> element
    container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '50%';
    container.style.left = '50%';
    container.style.transform = 'translate(-50%, -50%)';
    container.style.zIndex = '1';

    // Create the <canvas> element
    outputElement = document.createElement('canvas');
    outputElement.id = "videoOutput";
    outputElement.height = 480;
    outputElement.width = 640;
    outputElement.style.opacity = '0.5';

    // Add the <canvas> to the <div>
    container.appendChild(outputElement);

    // Add the <div> to the page <body>
    document.body.appendChild(container);

    // Request webcam access
    let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });

    // Set stream to display input
    inputElement.srcObject = stream;
    inputElement.play();

    // Wait for the video to be ready
    inputElement.onloadedmetadata = function() {

        // Initialize video capture
        capture = new cv.VideoCapture(inputElement);

        // Initialize a new feature based cascasde classifer
        classifier = new cv.CascadeClassifier();

        // Load pre-trained Haar Cascade for face detection
        let fileName = 'haarcascade_frontalface_default.xml'
        createFileFromUrl(fileName,
            () => {

                // Load the pre-defined trackers
                classifier.load(fileName);

                // Create frame Mat
                frame = new cv.Mat(inputElement.height, inputElement.width, cv.CV_8UC4);

                // Start processing
                processVideo();
            });

    };
}

/** Create a file (in JS memory) from a remote. */
function createFileFromUrl(fileName, callback) {
    let request = new XMLHttpRequest();
    request.open('GET', fileName, true);
    request.responseType = 'arraybuffer';
    request.onload = function(ev) {
        if (request.readyState === 4) {
            if (request.status === 200) {
                let data = new Uint8Array(request.response);
                cv.FS_createDataFile('/', fileName, data, true, false, false);
                callback();
            } else {
                console.error('Failed to load ' + fileName + ' status: ' + request.status);
            }
        }
    };
    request.send();
}

/** Processes the webcam video. */
function processVideo() {

    // Get the start time
    let begin = Date.now();

    // Create Mats for processing
    let gray = new cv.Mat();
    let faces = new cv.RectVector();
    
    // Capture frame
    capture.read(frame);

    // Flip the frame horizontally
    cv.flip(frame, frame, 1);
    
    // Convert to grayscale
    cv.cvtColor(frame, gray, cv.COLOR_RGBA2GRAY);
    
    // Detect faces
    classifier.detectMultiScale(gray, faces, 1.1, 3, 0);
    
    // Draw rectangles around the detected faces and store the results
    for (let i = 0; i < faces.size(); ++i) {
        let face = faces.get(i);
        let point1 = new cv.Point(face.x, face.y);
        let point2 = new cv.Point(face.x + face.width, face.y + face.height);
        cv.rectangle(frame, point1, point2, [0, 0, 255, 255], 2);
        // Append to faceslist
        facesList[i] = {
            x: Math.floor(face.x),
            y: Math.floor(face.y),
            w: Math.floor(face.width),
            h: Math.floor(face.height)
        };
    }

    // Show result
    cv.imshow('videoOutput', frame);

    // Clean up
    gray.delete();
    faces.delete();

    // Schedule next frame
    let delay = 1000/FPS - (Date.now() - begin);
    setTimeout(processVideo, Math.max(0, delay));

}
