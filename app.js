// initialize DOM objects
const startButton = document.getElementById('start-button');

const webcamContainer = document.getElementById('webcam-container');
const labelContainer = document.getElementById('label-container');

const modelButton = document.getElementById('choose-model-file');
const weightsButton = document.getElementById('choose-weights-file');
const metadataButton = document.getElementById('choose-metadata-file');

const modelInput = document.getElementById('upload-model');
const weightsInput = document.getElementById('upload-weights');
const metadataInput = document.getElementById('upload-metadata');

const modelLabel = document.getElementById('choose-model-file-label');
const weightsLabel = document.getElementById('choose-weights-file-label');
const metadataLabel = document.getElementById('choose-metadata-file-label');

// add listeners to inputs
let isRunning = false;
let isInit = false;

startButton.addEventListener('click', e => {
  webcamContainer.style.backgroundColor = 'transparent';
  labelContainer.style.backgroundColor = 'transparent';
  
  isRunning = !isRunning;
  startButton.children[0].innerHTML = isRunning ? 'pause' : 'play_arrow';
  
  if (isRunning) init();
});

modelButton.addEventListener('click', e => modelInput.click());
weightsButton.addEventListener('click', e => weightsInput.click());
metadataButton.addEventListener('click', e => metadataInput.click());

modelInput.addEventListener('change', e => modelLabel.innerHTML = e.target.files[0].name);
weightsInput.addEventListener('change', e => weightsLabel.innerHTML = e.target.files[0].name);
metadataInput.addEventListener('change', e => metadataLabel.innerHTML = e.target.files[0].name);

let model, webcam, maxPredictions;

async function init() {
  // load training data
  model = await tmImage.loadFromFiles(
    modelInput.files[0],
    weightsInput.files[0],
    metadataInput.files[0]
  );
  maxPredictions = model.getTotalClasses();

  // set up of webcam
  if (!isInit) {
    const flip = true;
    webcam = new tmImage.Webcam(500, 500, flip);
    await webcam.setup();
    await webcam.play();
    isInit = true;
  }

  window.requestAnimationFrame(loop);

  // append elements to the DOM
  webcamContainer.appendChild(webcam.canvas);
  for (let i = 0; i < maxPredictions; i++) {
    labelContainer.appendChild(document.createElement('div'));
  }
}

async function loop() {
  webcam.update(); // update the webcam frame
  await predict();
  if (isRunning) window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
  // predict can take in an image, video or canvas html element
  const prediction = await model.predict(webcam.canvas);
  for (let i = 0; i < maxPredictions; i++) {
    const classPrediction = `${prediction[i].className}: ${(prediction[i].probability * 100).toFixed(0)}%`;
    labelContainer.childNodes[i].innerHTML = classPrediction;
  }
}
