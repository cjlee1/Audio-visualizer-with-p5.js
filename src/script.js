var fft, // Allow us to analyze the song
    numBars = 1024, // The number of bars to use; power of 2 from 16 to 1024
    song, // The p5 sound object
    button,shockwave,react_x, react_y,radius, radius_old, deltarad, bar_height,
    isSeeking = 0,
    col = {
      r:255,
      g:0,
      b:0
    },

    col2 = {
      r:255,
      g:0,
      b:0
    };

    react_x = 0;
    react_y = 0;
    radius = 0;
    deltarad = 0;
    shockwave = 0;
    rot = 0;
    intensity = 0;

// Load our song
let analyzer;

var loader = document.querySelector(".loader");
document.getElementById("audiofile").onchange = function(event) {
    if(event.target.files[0]) {
        if(typeof song != "undefined") { // Catch already playing songs
            song.disconnect();
            song.stop();
            clear();
        }

        // Load our new song
        song = loadSound(URL.createObjectURL(event.target.files[0]));
        loader.classList.add("loading");
    }
}

function mode(action) {
  console.log(action);
  if(action == 'play'  )  {
    document.getElementById('button_play').style.display = "none";
    document.getElementById('button_pause').style.display = "block";
    song.play();
  }
  if(action == 'pause') {
    document.getElementById('button_play').style.display = "block";
    document.getElementById('button_pause').style.display = "none";
    song.pause();
  }
}

var canvas;

function setup() { // Setup p5.js
    canvas = createCanvas(windowWidth, windowHeight);
    colorMode(HSB);
    angleMode(DEGREES);
  
  var button = document.getElementById('play')
  
  // create a new Amplitude analyzer
  analyzer = new p5.Amplitude();
	
  // Patch the input to an volume analyzer
  analyzer.setInput(song);
  fft = new p5.FFT(0.9, 128);
}

col.r= 125;
col.g= 40;
col.b= 40;

col2.r= 125;
col2.g= 75;
col2.b= 75;

function changeCircle() {
  //circle change

  if (col2.g > 74 )  {
    col2.g= col2.g+1;
    col2.b= col2.b+1;
  }
  if (col2.g>93){
    col2.g= 75;
    col2.b= 75;
  }
}

function changeBackground() {

  //background change
  if (col.g > 39 )  {
    col.g= col.g+1;
    col.b= col.b+1;
  }
  if (col.g>75){
    col.g= 20;
    col.b= 20;
  }
}

function changeHue() {
  if (col.r >=0)  {
    col.r= col.r+60;
    col2.r=col2.r+60;
  }
  if (col.r >360)  {
    col.r= 0;
    col2.r=0;
  }
}

//when cursor isn't on the page, it will hide the navbar, play and pause button and other stuff.
(function() {
    var mouseTimer = null, cursorVisible = true;

    function disappearCursor() {
        mouseTimer = null;
        document.body.style.cursor = "none";
		document.getElementById("hideBody").style.opacity = 0;
        cursorVisible = false;
    }

    document.onmousemove = function() {
        if (mouseTimer) {
            window.clearTimeout(mouseTimer);
        }
        if (!cursorVisible) {
            document.body.style.cursor = "default";
			document.getElementById("hideBody").style.opacity = 100;
            cursorVisible = true;
        }
        mouseTimer = window.setTimeout(disappearCursor, 3000);
    };
})();

function touchStarted() {
  getAudioContext().resume()
}

function draw() {
    background(51);
	
    rot = rot + intensity * 0.0000001;
    react_x = 0;
    react_y = 0;
    intensity = 0;
	
    if(typeof song != "undefined"
       && song.isLoaded()
       && !song.isPlaying()) { // Do once
        loader.classList.remove("loading");

        song.setVolume(0.5);

        fft = new p5.FFT(0.9, 128);
        fft.waveform(numBars);
        fft.smooth(0.85);
    }

    if(typeof fft != "undefined") {
        background(col.r,col.g,col.b);
        var spectrum = fft.analyze();
        
        colorMode(HSL);
        translate(width / 2, height / 2);
			
        //beginShape();
        const rms = max(25,25 + analyzer.getLevel()*50);
        const base_radius =150;
        let offset = 440 * sin(frameCount /400);
        var noise =0;
        for (var i = 0; i < spectrum.length; i++) {
          rads = PI * 2 /  spectrum.length;

          bar_height = min(99999, max((spectrum[i] * 2.5 - 200), 0));

					// const noise2 = max(0.1, noise(i+offset) * 2 );
					// console.log(noise2);					
          const dist= map(spectrum[i]*1.4,1,256,1,80);
          var angle = map((i+offset)%spectrum.length, 0, spectrum.length, 0, 360);
          const dist2= map(spectrum[i]*1.4,1,256,1,80);
          var angle2 = map((i+offset)%spectrum.length, 0, spectrum.length, 0, 360);
					
          //for lines
          var amp = spectrum[i];
          var r = map(amp, 0, 256, 20, 100);
          var x2 = (bar_height+base_radius+rms) * cos(angle);
          var y2 = (bar_height+base_radius+rms) * sin(angle);
         
					//the  circle shape for lines
          var x = (bar_height+base_radius+rms+dist) * cos(angle);
          var y = (bar_height+base_radius+rms+dist) * sin(angle);
          
					// inner circle
          var x3 = (r) * cos(angle2);
          var y3 = (r) * sin(angle2);

          stroke(col2.r, col2.g, col2.b);
          line(x2,y2 , x, y);

      //circle
          stroke(col2.r, col2.g, col2.b);
          line(0, 0,x3,y3);

          react_x += Math.cos(rads * i + rot) * (radius + bar_height);
        	react_y += Math.sin(rads * i + rot) * (radius + bar_height);

        	intensity += bar_height;
          //vertex(x, y);
          //var y = map(amp, 0, 256, height, 0);
          //rect(i * w, y, w - 2, height - y);
          center_x = windowWidth / 2 - (react_x * 0.007);
          center_y = windowHeight / 2 - (react_y * 0.007);

          radius_old = radius;
          radius =  25 + (intensity * 0.002);
          deltarad = radius - radius_old;


          stroke(col2.r, col2.g, col2.b);
          circle(0, 0, radius + 2, 0, Math.PI * 2, false);

          if (deltarad > 15) {
            shockwave = 0;
            strokeWeight(1);
            stroke(col2.r, col2.g, col2.b);
            rect(0, 0, 0, 0);

            rot = rot + 0.4;
          }
        }
    }
}
setInterval(changeCircle,1000);
setInterval(changeBackground,5000);
setInterval(changeHue,10000);

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
