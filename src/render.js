// Requires.
const { desktopCapturer } = require('electron');
const { Menu } = require('@electron/remote');
const { saveVideo } = require('./saveVideo');

// Grab html elements.
const videoSelectBtn = document.getElementById('videoSelectBtn');
const videoElement = document.getElementById('videoElement');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');

// notification elements.
const notificationContainer = document.getElementById('notificationContainer');
const notificationContent = document.getElementById('notificationContent');
const closeNotificationBtn = document.getElementById('closeNotificationContainer');

const showNotification = () => notificationContainer.classList.add('is-active');
const hideNotification = () => notificationContainer.classList.remove('is-active');

// Media recorder related.
let mediaRecorder;
const recordedChunks = [];
const MEDIA_RECORDER_OPTIONS = { mimeType: 'video/webm; codecs=vp9' };

// Create handler for video select on click event.
const handleVideoSelectClick = async () => {
  const inputSources = await desktopCapturer.getSources({ types: ['window', 'screen'] });

  // Create & Display popup menu.
  const inputSourcesListMenu = Menu.buildFromTemplate(
    inputSources.map(source => {
      return {
        label: source.name,
        click: () => selectSource(source),
      };
    })
  );

  inputSourcesListMenu.popup();
};

// Handle source selection.
const selectSource = async source => {
  videoSelectBtn.innerHTML = source.name;

  // Create media stream.
  const mediaStreamConstraints = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: source.id,
      },
    },
  };
  const mediaStream = await navigator.mediaDevices.getUserMedia(mediaStreamConstraints);

  // Preview the source in the video element.
  videoElement.srcObject = mediaStream;
  videoElement.play();

  // Create the media recorder.
  const mediaRecorderOptions = MEDIA_RECORDER_OPTIONS;
  mediaRecorder = new MediaRecorder(mediaStream, mediaRecorderOptions);

  // Register event handlers.
  mediaRecorder.ondataavailable = e => recordedChunks.push(e.data);

  mediaRecorder.onstop = e => saveVideo(recordedChunks, MEDIA_RECORDER_OPTIONS);
};

const handleStartClick = e => {
  if (startBtn.innerText === 'Recording') return;

  if (mediaRecorder === undefined) {
    notificationContent.innerHTML = 'Select a source to record...';
    showNotification();
    return;
  }

  mediaRecorder.start();
  startBtn.classList.add('is-danger');
  startBtn.innerText = 'Recording';
};

const handleStopClick = e => {
  if (mediaRecorder === undefined || mediaRecorder.state === 'inactive') {
    notificationContent.innerText = 'Whoops, nothing to save...';
    showNotification();
    return;
  }
  mediaRecorder.stop();
  startBtn.classList.remove('is-danger');
  startBtn.innerText = 'Start';
};

// Add click handlers
videoSelectBtn.onclick = handleVideoSelectClick;
startBtn.onclick = handleStartClick;
stopBtn.onclick = handleStopClick;
closeNotificationBtn.onclick = hideNotification;
