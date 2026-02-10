
let bgShift = 0;
let particlesBack = [], particlesMid = [], particlesFront = [];
let relics = [], foundRelics = [], relicShapes = [], relicTimers = [], revealedRelics = [], relicPulses = [];
const shapes = ['circle', 'triangle', 'square', 'diamond', 'hexagon'];

let flickers = [];
let started = false, allFound = false, fadeOut = 0;
let endingTypeIndex = 0;
let finalLines = [
  "You found all five relics.",
  "They've returned to where they belong.",
  "The abyss begins to heal.",
  "Balance has been restored."
];
let typeTimer = 0, showLines = [], disappearingAlpha = [];
const totalRelics = 5;
const glowThreshold = 120;

let titleFade = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 1);
  textFont('Georgia');
  noStroke();

  for (let i = 0; i < 80; i++) particlesBack.push(new Particle(random(width), random(height), 0.5));
  for (let i = 0; i < 100; i++) particlesMid.push(new Particle(random(width), random(height), 1));
  for (let i = 0; i < 80; i++) particlesFront.push(new Particle(random(width), random(height), 1.5));

  let margin = 150;
  for (let i = 0; i < totalRelics; i++) {
    relics.push(createVector(random(margin, width - margin), random(margin, height - margin)));
    foundRelics.push(false);
    revealedRelics.push(false);
    relicShapes.push(shapes[i]);
    relicTimers.push(0);
    relicPulses.push(0);
  }

  for (let i = 0; i < 30; i++) {
    flickers.push({ x: random(width), y: random(height), life: int(random(200, 600)), delay: int(random(600)) });
  }
}

function draw() {
  bgShift = sin(frameCount * 0.001) * 20;
  let c1 = color(220 - bgShift, 30, 15);
  let c2 = color(180 - bgShift, 30, 15);
  setBackgroundGradient(c1, c2);
  drawCausticBands();

  for (let p of particlesBack) p.update(-0.1), p.display();
  for (let p of particlesMid) p.update(0), p.display();
  for (let p of particlesFront) p.update(0.2), p.display();

  if (!started) {
    titleFade = min(255, titleFade + 2);
    fill(255, titleFade / 255);
    textSize(28);
    textAlign(CENTER, CENTER);
    text("The Abyssal Relic Quest", width / 2, height / 2 - 60);
    textSize(16);
    text("You are the last explorer.\nIn the abyss, five sacred relics await.\nFind them. Restore balance.\nPress any key to begin.", width / 2, height / 2 + 20);
    return;
  }

  for (let i = 5; i >= 1; i--) {
    fill(220, 50, 100, 0.02 * i);
    ellipse(mouseX, mouseY, 5 + i * 20);
  }

  for (let f of flickers) {
    if (frameCount > f.delay && f.life > 0) {
      fill(180, 50, 100, f.life / 600);
      ellipse(f.x, f.y, 2);
      f.life--;
    }
  }

  let relicsFound = 0;
  for (let i = 0; i < relics.length; i++) {
    let r = relics[i];
    let d = dist(mouseX, mouseY, r.x, r.y);

    if (d < 80 && !foundRelics[i]) {
      relicTimers[i]++;
      if (relicTimers[i] > glowThreshold) {
        foundRelics[i] = true;
        relicPulses[i] = 30; 
      }
    } else if (!foundRelics[i]) {
      relicTimers[i] = max(0, relicTimers[i] - 1);
    }

    if (foundRelics[i]) relicsFound++;

    if (relicTimers[i] > 0) {
      for (let a = 0; a < 8; a++) {
        let angle = random(TWO_PI);
        let radius = random(4, 10);
        let x = r.x + cos(angle) * radius;
        let y = r.y + sin(angle) * radius;
        let alpha = map(relicTimers[i], 0, glowThreshold, 0, 0.4);
        fill(50, 80, 100, alpha);
        ellipse(x, y, random(2, 4));
      }
    }

    if (relicPulses[i] > 0) {
      noFill();
      stroke(50, 80, 100, relicPulses[i] / 30);
      strokeWeight(2);
      ellipse(r.x, r.y, 40 + (30 - relicPulses[i]) * 4);
      relicPulses[i]--;
    }
  }

  drawChecklist(relicsFound);

  if (!allFound && relicsFound === totalRelics) {
    allFound = true;
    showLines = [];
    disappearingAlpha = Array(finalLines.length).fill(255);
    endingTypeIndex = 0;
    typeTimer = 0;
  }

  if (allFound) {
    fadeOut += 1;
    fill(0, fadeOut * 0.01);
    rect(0, 0, width, height);
    if (fadeOut > 150) {
      textAlign(CENTER, CENTER);
      typeTimer++;
      if (typeTimer % 90 === 0 && endingTypeIndex < finalLines.length) {
        showLines.push(finalLines[endingTypeIndex]);
        endingTypeIndex++;
      }
      for (let i = 0; i < showLines.length; i++) {
        fill(i === finalLines.length - 1 ? color(0, 100, 100, disappearingAlpha[i] / 255) : color(255, disappearingAlpha[i] / 255));
        textSize(22);
        text(showLines[i], width / 2, height / 2 - 60 + i * 30);
        if (disappearingAlpha[i] > 0 && i < finalLines.length - 1) disappearingAlpha[i] -= 0.3;
      }
    }
  }
}

function keyPressed() {
  if (!started) started = true;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function drawChecklist(relicsFound) {
  push();
  let d = min(...relics.map(r => dist(mouseX, mouseY, r.x, r.y)));
  let opacity = d < 120 ? 255 : 80;
  fill(255, opacity / 255);
  textSize(14);
  textAlign(LEFT);
  text("Recovered:", 30, 30);
  for (let i = 0; i < totalRelics; i++) {
    let x = 50;
    let y = 60 + i * 25;
    drawRelicShape(relicShapes[i], x, y, 10, foundRelics[i] ? color(120, 50, 90) : color(0, 0, 60));
  }
  pop();
}

function drawRelicShape(type, x, y, size, col) {
  fill(col);
  noStroke();
  push();
  translate(x, y);
  if (type === 'circle') ellipse(0, 0, size);
  else if (type === 'triangle') rotate(PI), triangle(-size / 2, size / 2, size / 2, size / 2, 0, -size / 2);
  else if (type === 'square') rectMode(CENTER), rect(0, 0, size, size);
  else if (type === 'diamond') rotate(PI / 4), rectMode(CENTER), rect(0, 0, size, size);
  else if (type === 'hexagon') {
    beginShape();
    for (let a = 0; a < TWO_PI; a += TWO_PI / 6) vertex(cos(a) * size / 2, sin(a) * size / 2);
    endShape(CLOSE);
  }
  pop();
}

function setBackgroundGradient(c1, c2) {
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(0, y, width, y);
  }
}

function drawCausticBands() {
  noFill();
  stroke(220, 50, 80, 0.05);
  for (let y = 0; y < height; y += 30) {
    beginShape();
    for (let x = 0; x <= width; x += 20) {
      let offset = sin((x * 0.01) + (frameCount * 0.01)) * 5;
      vertex(x, y + offset);
    }
    endShape();
  }
}

class Particle {
  constructor(x, y, depth) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-2, 2), random(-2, 2));
    this.size = random(3, 8) * depth;
    this.depth = depth;
    this.speedFactor = map(this.size, 3, 8, 0.5, 2) * depth;
    this.behaviour = random(['timid', 'curious', 'drifter']);
    this.hue = random(180, 240);
  }

  update(parallax) {
    this.pos.x += parallax;
    let distance = dist(mouseX, mouseY, this.pos.x, this.pos.y);
    let lightRadius = 100;
    if (distance < lightRadius) {
      let repel = p5.Vector.sub(this.pos, createVector(mouseX, mouseY));
      if (this.behaviour === 'timid') repel.setMag(2);
      else if (this.behaviour === 'curious') repel.setMag(0.5);
      else repel.setMag(0);
      this.vel.add(repel);
    }
    if (this.behaviour === 'timid' && random(1) < 0.001) {
      this.vel.add(p5.Vector.random2D().mult(5));
    }
    let angle = noise(this.pos.x * 0.005, this.pos.y * 0.005) * TWO_PI * 2;
    let dir = p5.Vector.fromAngle(angle);
    this.vel.add(dir.mult(0.05));
    this.vel.limit(2 * this.speedFactor);
    this.pos.add(this.vel);

    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.y > height) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = height;
  }

  display() {
    let d = dist(mouseX, mouseY, this.pos.x, this.pos.y);
    let brightness = map(d, 0, 200, 100, 10);
    brightness = constrain(brightness, 10, 100);
    let flicker = random(0.9, 1.1);
    fill(this.hue, 100, brightness * flicker, 0.9);
    ellipse(this.pos.x, this.pos.y, this.size);
  }
}
