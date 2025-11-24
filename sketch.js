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

let filterGraphic;
let typeFilterNames = ["Poster", "Drawing", "Painting", "Sticker"];
let typeFilter = [true, true, true, true];
let surfaceFilterNames = ["Post", "Wall", "Door", "Ground"];
let surfaceFilter = [true, true, true, true];

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
  filterGraphic = createGraphics(windowWidth * 0.4, windowHeight * 0.5);

  selectedArt = artList[0];
  selectedImage = loadImage(artList[0].path);
}

function draw() {
  drawMap();
  drawDetails();
  drawFilter();
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
  if (mouseX < window.width * 0.6) {
    let hit = selectionCheck();

    if (typeof hit !== "undefined" && selectedArt != hit) {
      console.log(hit);
      selectedArt = hit;
      selectedImage = loadImage(hit.path);
    }
  } else {
    for (let i = 0; i < 4; i++) {
      if (inBounds(mouseX, mouseY, window.width * 0.6 + filterGraphic.width * 0.05, window.height * 0.5 + filterGraphic.height * 0.05 * (3 + 4 * i), filterGraphic.width * 0.4, filterGraphic.height * 0.1)) {
        typeFilter[i] = !typeFilter[i];
        console.log("boop");
      }
    }

    for (let i = 0; i < 4; i++) {
      if (inBounds(mouseX, mouseY, window.width * 0.6 + filterGraphic.width * 0.55, window.height * 0.5 + filterGraphic.height * 0.05 * (3 + 4 * i), filterGraphic.width * 0.4, filterGraphic.height * 0.1)) {
        surfaceFilter[i] = !surfaceFilter[i];
        console.log("bop");
      }
    }
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

    switch (a.type) {
      case "poster":
        if (!typeFilter[0]) continue;
        break;
      case "drawing":
        if (!typeFilter[1]) continue;
        break;
      case "painting":
        if (!typeFilter[2]) continue;
        break;
      case "sticker":
        if (!typeFilter[3]) continue;
        break;
    }
    
    switch (a.surface) {
      case "post":
        if (!surfaceFilter[0]) continue;
        break;
      case "wall":
        if (!surfaceFilter[1]) continue;
        break;
      case "door":
        if (!surfaceFilter[2]) continue;
        break;
      case "ground":
        if (!surfaceFilter[3]) continue;
        break;
    }

    if (selectedArt == a) {
      map.graphic.strokeWeight(1);
      map.graphic.stroke(170);
      map.graphic.fill(255);
      map.graphic.circle((a.x - map.pos.x / map.scl) * map.scl , (a.y - map.pos.y / map.scl) * map.scl, 20);
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

function drawDetails() {
  selectedDetailsGraphic.background(220);

  if (typeof selectedImage !== "undefined") {
    if (selectedImage.width > selectedImage.height) {
      selectedDetailsGraphic.image(selectedImage, 0, 0, windowWidth * 0.2, selectedImage.height / (selectedImage.width / (windowWidth * 0.2)));
    } else {
      selectedDetailsGraphic.image(selectedImage, 0, 0, selectedImage.width / (selectedImage.height / (windowHeight * 0.5)), windowHeight * 0.5);
    }
  }

  selectedDetailsGraphic.text("TYPE: " + selectedArt.type + "\nSURFACE: " + selectedArt.surface, selectedDetailsGraphic.width * 0.65, selectedDetailsGraphic.height * 0.45);

  image(selectedDetailsGraphic, window.width * 0.6, 0);
}

function drawFilter() {
  filterGraphic.background(200);

  filterGraphic.text("TYPE", filterGraphic.width * 0.05, filterGraphic.height * 0.075);
  filterGraphic.text("SURFACE", filterGraphic.width * 0.55, filterGraphic.height * 0.075);

  for (let i = 0; i < 4; i++) {
    if (typeFilter[i]) filterGraphic.fill(255);
    else filterGraphic.fill(150);
    filterGraphic.rect(filterGraphic.width * 0.05, filterGraphic.height * 0.05 * (3 + 4 * i), filterGraphic.width * 0.4, filterGraphic.height * 0.1);
    filterGraphic.fill(0);
    filterGraphic.text(typeFilterNames[i], filterGraphic.width * 0.065, filterGraphic.height * 0.05 * (4.15 + 4 * i))
  }

  for (let i = 0; i < 4; i++) {
    if (surfaceFilter[i]) filterGraphic.fill(255);
    else filterGraphic.fill(150);
    filterGraphic.rect(filterGraphic.width * 0.55, filterGraphic.height * 0.05 * (3 + 4 * i), filterGraphic.width * 0.4, filterGraphic.height * 0.1);
    filterGraphic.fill(0);
    filterGraphic.text(surfaceFilterNames[i], filterGraphic.width * 0.565, filterGraphic.height * 0.05 * (4.15 + 4 * i))
  }


  image(filterGraphic, window.width * 0.6, window.height * 0.5);
}

function inBounds(px, py, x, y, w, h) {
  console.log("beep");
  return px >= x && px <= x + w && py >= y && py <= y + h;
}

class Art {
  constructor(file, type, surface, x, y) {
    this.path = "./assets/images/" + file;
    this.type = type;
    this.surface = surface;
    this.x = x;
    this.y = y;
  }
}
