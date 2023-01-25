// Add an event listener that waits for the DOM content to load before running the function
addEventListener("DOMContentLoaded", function(event) {

    // Create a new AudioContext
    const audioCtx = new AudioContext();

    // Map keyboard keys to their corresponding frequencies
    const keyboardFrequencyMap = {
        '90': 261.625565300598634,  //Z - C
        '83': 277.182630976872096, //S - C#
        '88': 293.664767917407560,  //X - D
        '68': 311.126983722080910, //D - D#
        '67': 329.627556912869929,  //C - E
        '86': 349.228231433003884,  //V - F
        '71': 369.994422711634398, //G - F#
        '65': 391.995435981749294,  //B - G
        '72': 415.304697579945138, //H - G#
        '78': 440.000000000000000,  //N - A
        '74': 466.163761518089916, //J - A#
        '77': 493.883301256124111,  //M - B
        '81': 523.251130601197269,  //Q - C
        '50': 554.365261953744192, //2 - C#
        '87': 587.329535834815120,  //W - D
        '51': 622.253967444161821, //3 - D#
        '69': 659.255113825739859,  //E - E
        '82': 698.456462866007768,  //R - F
        '53': 739.988845423268797, //5 - F#
        '84': 783.990871963498588,  //T - G
        '54': 830.609395159890277, //6 - G#
        '89': 880.000000000000000,  //Y - A
        '55': 932.327523036179832, //7 - A#
        '85': 987.766602512248223,  //U - B
    };

    // Add an event listener for when a key is pressed down
    document.addEventListener('keydown', keyDown, false);

// Add an event listener for when a key is released 
//document.addEventListener('keyup', keyUp, false);

// Create an object to store active oscillators
activeOscillators = {};

// Function to run when a key is pressed down
function keyDown(event) {
    // Get the key that was pressed
    const key = (event.detail || event.which).toString();
    // Check the value of the arpeggiator element
    const isArp = document.getElementById("arpeggiator").value;
    // If the arpeggiator is off and the key is in the frequency map
    if(isArp==0){
        if (keyboardFrequencyMap[key] && !activeOscillators[key] ) { 
	    // Play the note
            playNote(key);
          }
    }

    // If the arpeggiator is on
    if(isArp ==1){
        if (keyboardFrequencyMap[key]) { //&& !activeOscillators[key]
	    // Play the note
            playNote(key);
	    // Call the arpeggiator function with different offsets
            arpeggiator(key-2, 0.2);
            arpeggiator(key-16, 0.4);
            arpeggiator(key, 0.6);
            arpeggiator(key-16, 0.8);
          }
    }
    
}

// Array of wave types for the oscillator
const wavType = [
    'sine',
    'sawtooth',
    'square',
    'triangle'
];

function playNote(key) {
    // Set values for the envelope of the note
    const attackTime = 0.2;
    const decayTime = 0.3;
    const sustainLevel = 0.7;
    const releaseTime = 0.2;

    // Create a gain node to control the volume of the note
    const primaryGainControl = audioCtx.createGain();

    // Set the initial gain value to 0.08
    primaryGainControl.gain.setValueAtTime(0.08, 0);

    // Connect to the final output destination
    primaryGainControl.connect(audioCtx.destination);
    
    // Create an oscillator for the note
    const osc = audioCtx.createOscillator();
	
    // Set the frequency of the oscillator to the corresponding frequency of the key pressed
    osc.frequency.setValueAtTime(keyboardFrequencyMap[key], audioCtx.currentTime);

    // Set the wave type of the oscillator to the wave type chosen by the user on the frontend
    osc.type = wavType[document.getElementById("pitch").value]; 
    
    // Create a gain node and set the envelope of the note
    const oscGain = audioCtx.createGain();
    oscGain.gain.setValueAtTime(0, 0);
    oscGain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + attackTime);
    oscGain.gain.linearRampToValueAtTime(sustainLevel, audioCtx.currentTime+attackTime+decayTime);
    oscGain.gain.linearRampToValueAtTime(sustainLevel, audioCtx.currentTime +1-releaseTime);
    oscGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1);
    
    // Connect the note to the gain
    osc.connect(oscGain);

    // Connect the gain to the volume 
    oscGain.connect(primaryGainControl);

    // Start the oscillator
    osc.start();
    activeOscillators[key] = osc;

    // Stop the oscillator after 1 second and remove it 
    // from the list of active oscillators
    osc.stop(audioCtx.currentTime +1);
    delete activeOscillators[key];
  }


  function arpeggiator(key, delayTime) {
    // Set values for the envelope of the note
    const attackTime = 0.2;
    const decayTime = 0.3;
    const sustainLevel = 1.2;
    const releaseTime = 0.2;

    // Store the delay time for the arpeggiator
    this.delayTime = delayTime;

    // Create a gain control node to control the volume of the arpeggiator
    const primaryGainControl = audioCtx.createGain();
    primaryGainControl.gain.setValueAtTime(0.08, 0);

    // Connect to the final output destination
    primaryGainControl.connect(audioCtx.destination);
    
    // Create an oscillator for the arpeggiator
    const osc = audioCtx.createOscillator();
    osc.frequency.setValueAtTime(keyboardFrequencyMap[key], audioCtx.currentTime);
    osc.type = wavType[document.getElementById("pitch").value]; 
    
    // Create a gain node and set the envelope of the note
    const oscGain = audioCtx.createGain();
    oscGain.gain.setValueAtTime(0, 0);
    oscGain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + attackTime);
    oscGain.gain.linearRampToValueAtTime(sustainLevel, audioCtx.currentTime+attackTime+decayTime);
    oscGain.gain.linearRampToValueAtTime(sustainLevel, audioCtx.currentTime +1-releaseTime);
    oscGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.5);
    
    // Create a delay node to delay the start of the oscillators
    // which creates the arpeggiator effect
    const delayNode = new DelayNode(audioCtx, {
        delayTime: this.delayTime,
        maxDelayTime: 4,
      });

    // Connect the oscillator to the delay node
    osc.connect(delayNode);
	
    // Connect the delay node to the gain node
    delayNode.connect(oscGain);

    // Connect the gain node to the volume control
    oscGain.connect(primaryGainControl);

    // Start the oscillator
    osc.start();
    activeOscillators[key] = osc;

    // Stop the oscillator after 1 second and remove it 
    // from the list of active oscillators
    osc.stop(audioCtx.currentTime +1+this.delayTime);
    //delete activeOscillators[key];
  }

}, false);  



 
