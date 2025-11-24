const map = {
  gOrigin: undefined,
  gSize: undefined,
  graphic: undefined,
  img: undefined,
  scl: undefined,
  pos: undefined
};

let mouseDragOrigin;
let mapDragOrigin;

let artList = [];
let selectedArt;
let selectedImage;
let selectedDetailsGraphic;

function preload() {
  map.img = loadImage("./assets/GTmap.png");

  fetch('./assets/data.json')
    .then(response => response.json()) // Parse JSON
    .then(data => {
      for (let i = 0; i < data.length; i++) {
        let d = data[i];
        artList.push(new Art(d.file, d.type, d.location, d.posX, d.posY));
      }
    }); // Work with JSON data
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  setupMap();
  selectedDetailsGraphic = createGraphics(windowWidth * 0.4, windowHeight * 0.5);

  selectedArt = artList[0];
  selectedImage = loadImage(artList[0].path);
}

function draw() {
  background(0, 255, 0);
  drawMap();

  selectedDetailsGraphic.background(255, 0, 0);

  if (typeof selectedImage !== "undefined") {
    if (selectedImage.width > selectedImage.height) {
      selectedDetailsGraphic.image(selectedImage, 0, 0, windowWidth * 0.2, selectedImage.height / (selectedImage.width / (windowWidth * 0.2)));
    } else {
      selectedDetailsGraphic.image(selectedImage, 0, 0, selectedImage.width / (selectedImage.height / (windowHeight * 0.5)), windowHeight * 0.5);
    }
  }

  selectedDetailsGraphic.text("TYPE: " + selectedArt.type + "\nSURFACE: " + selectedArt.location, selectedDetailsGraphic.width * 0.5, selectedDetailsGraphic.height * 0.05);


  image(selectedDetailsGraphic, window.width * 0.6, 0);
}

function mousePressed() {
  if (mouseX > windowWidth * 0.6) return;
  mouseDragOrigin = createVector(mouseX, mouseY);
  mapDragOrigin = createVector(map.pos.x, map.pos.y);
}

function mouseDragged() {
  if (mouseX > windowWidth * 0.6) return;
  if (typeof mouseDragOrigin === "undefined") {
    mouseDragOrigin = createVector(mouseX, mouseY);
    mapDragOrigin = createVector(map.pos.x, map.pos.y);
  }
  var dm = createVector(mouseX - mouseDragOrigin.x, mouseY - mouseDragOrigin.y);
  dPos = p5.Vector.div(dm, map.scl)
  map.pos = p5.Vector.sub(mapDragOrigin, dm);
}

function mouseWheel(event) {
  var factor = event.delta > 0 ? 0.9 : 1.1;
  

  // var dir = createVector(map.gSize.x / 2, map.gSize.y / 2).normalize().mult(-1);
  var imgDelta = createVector((map.img.width * map.scl * factor) - (map.img.width * map.scl), (map.img.height * map.scl * factor) - (map.img.height * map.scl));
  var posAdj = createVector(imgDelta.x/2, imgDelta.y/2);
  map.pos.add(posAdj);

  // console.log(imgDelta);

  map.scl *= factor;
}

function mouseClicked() {
  let hit = selectionCheck();

  if (typeof hit !== "undefined" && selectedArt != hit) {
    console.log(hit);
    selectedArt = hit;
    selectedImage = loadImage(hit.path);
  }
}

function selectionCheck() {
  let amx = mouseX / map.scl + map.pos.x / map.scl;
  let amy = mouseY / map.scl + map.pos.y / map.scl;
  let lastHitDiff = Infinity;
  let hit;
  for (let i = 0; i < artList.length; i++) {
    let a = artList[i];
    let diff = createVector(a.x - amx, a.y - amy).mag();
    if (diff < 6 / map.scl && diff < lastHitDiff) {
      lastHitDiff = diff;
      hit = a;
    }
  }

  return hit;
}

function drawMap() {
  map.graphic.background(241);
  map.graphic.image(map.img, -map.pos.x, -map.pos.y, map.img.width * map.scl, map.img.height * map.scl);

  let hit = selectionCheck();

  for (let i = 0; i < artList.length; i++) {
    let a = artList[i];

    if (selectedArt == a) {
      map.graphic.strokeWeight(1);
      map.graphic.stroke(170);
      map.graphic.fill(255);
      map.graphic.circle((a.x - map.pos.x / map.scl) * map.scl , (a.y - map.pos.y / map.scl) * map.scl, 18);
      map.graphic.strokeWeight(2);
      map.graphic.stroke(155, 0, 0);
      map.graphic.fill(255, 0, 0);
      map.graphic.circle((a.x - map.pos.x / map.scl) * map.scl , (a.y - map.pos.y / map.scl) * map.scl, 12);
    } else if (hit == a) {
      map.graphic.strokeWeight(2);
      map.graphic.stroke(155, 0, 0);
      map.graphic.fill(255, 0, 0);
      map.graphic.circle((a.x - map.pos.x / map.scl) * map.scl , (a.y - map.pos.y / map.scl) * map.scl, 14);
    } else {
      map.graphic.strokeWeight(2);
      map.graphic.stroke(155, 0, 0);
      map.graphic.fill(255, 0, 0);
      map.graphic.circle((a.x - map.pos.x / map.scl) * map.scl , (a.y - map.pos.y / map.scl) * map.scl, 10);
    }
  }

  image(map.graphic, map.gOrigin.x, map.gOrigin.y);
}

function setupMap() {
  map.gOrigin = createVector(0, 0);
  map.gSize = createVector(windowWidth * 0.6, windowHeight);
  map.graphic = createGraphics(map.gSize.x, map.gSize.y);

  map.scl = 0.1;
  map.pos = createVector(-190, 0);
}

class Art {
  constructor(file, type, location, x, y) {
    this.path = "./assets/images/" + file;
    this.type = type;
    this.location = location;
    this.x = x;
    this.y = y;
  }
}
