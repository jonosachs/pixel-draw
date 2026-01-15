const canvasEl = document.getElementById("canvas");
const inputEl = document.getElementById("input");

const helpBtn = document.getElementById("help-btn");
const clearBtn = document.getElementById("clear-btn");
const saveBtn = document.getElementById("save-btn");
const loadBtn = document.getElementById("load-btn");
const getPixelsBtn = document.getElementById("getPixels-btn");
const uploadBtn = document.getElementById("upload-btn");
const fileInput = document.getElementById("fileInput");
const drawPixelsBtn = document.getElementById("drawPixels-btn");
const colorSlider = document.getElementById("colorSlider");

const BOX = 25;
const TOTAL_PIXELS = BOX * BOX;
// const PIXEL_WIDTH = 31;

let currentColor = "black";

clearBtn?.addEventListener("click", clear);
saveBtn?.addEventListener("click", save);
loadBtn?.addEventListener("click", load);
getPixelsBtn?.addEventListener("click", getPixelIds);
drawPixelsBtn?.addEventListener("click", drawPixelsFromInput);
helpBtn?.addEventListener("click", toggleHelp);
inputEl?.addEventListener("input", drawPixelsFromInput);
uploadBtn?.addEventListener("click", () => fileInput.click());
fileInput?.addEventListener("change", getImageFromFile);
colorSlider?.addEventListener("input", updateColor);

drawPixelGrid();

function drawPixelGrid() {
  for (let i = 1; i <= TOTAL_PIXELS; i++) {
    const pixel = document.createElement("p");
    pixel.id = `pix${i}`;
    pixel.className = "pixel";
    pixel.textContent = i;
    pixel.addEventListener("mouseover", (event) => managePenEvent(event, pixel));
    pixel.addEventListener("mousedown", (event) => managePenEvent(event, pixel));
    canvasEl.appendChild(pixel);
  }
}

function managePenEvent(event, pixel) {
  if (event.type === "click" || event.buttons === 1) {
    if (event.metaKey) erasePixel(pixel);
    else drawPixel(pixel);
  }
}

function drawPixel(pixel) {
  pixel.style.backgroundColor = currentColor;
  // pixel.classList.add("pixel-color");
}

function erasePixel(pixel) {
  pixel.classList.remove("pixel-color");
  pixel.style.backgroundColor = "";
}

function getImageFromFile() {
  const file = fileInput.files[0];
  if (!file) {
    console.log("No file found");
    return;
  }

  const img = new Image();
  const url = URL.createObjectURL(file);

  img.onload = () => {
    pixelateImage(img);
    URL.revokeObjectURL(url);
  };

  img.src = url;

  console.log("Image loaded");
}

function pixelateImage(img) {
  clear();

  const canvas = document.createElement("canvas");

  canvas.width = BOX;
  canvas.height = BOX;
  const ctx = canvas.getContext("2d");

  const imgW = img.naturalWidth;
  const imgH = img.naturalHeight;

  const scale = Math.min(BOX / imgW, BOX / imgH);

  const drawW = imgW * scale;
  const drawH = imgH * scale;

  const offsetX = (BOX - drawW) / 2;
  const offsetY = (BOX - drawH) / 2;

  ctx.fillStyle = "transparent";
  ctx.fillRect(0, 0, BOX, BOX);
  ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
  const imageData = ctx.getImageData(0, 0, BOX, BOX).data;

  console.log("Getting rgba data");

  let pixelId = 1;

  for (let pointer = 0; pointer <= imageData.length && pixelId <= TOTAL_PIXELS; pointer += 4) {
    const [r, g, b, a] = imageData.slice(pointer, pointer + 4);

    const pixel = document.getElementById(`pix${pixelId++}`);

    if (a === 0) continue;
    else pixel.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
  }

  console.log("Complete");
}

// Clear canvas
function clear() {
  const all = document.querySelectorAll(".pixel");

  all.forEach((pixel) => {
    pixel.classList.remove("pixel-color");
    pixel.style.backgroundColor = "";
  });

  setInput("");
}

// Save drawing to web storage
function save() {
  localStorage.clear();

  for (let i = 1; i <= TOTAL_PIXELS; i++) {
    const pix = document.getElementById(`pix${i}`);
    localStorage.setItem(pix.id, pix.className);
  }

  localStorage ? console.log("Saved") : console.log("Save Failed");
}

// Load drawing from web storage
//TODO: save and load pixel colors
function load() {
  clear();

  for (let i = 1; i <= TOTAL_PIXELS; i++) {
    const currentPixel = document.getElementById(`pix${i}`);
    const storedPixel = localStorage.getItem(currentPixel.id);

    if (!storedPixel) {
      console.log("Load failed");
      return;
    }

    storedPixel.includes("pixel-color")
      ? currentPixel.classList.add("pixel-color")
      : currentPixel.classList.remove("pixel-color");
  }

  console.log("Loaded");
}

function drawPixelsFromInput() {
  if (!inputEl.value) {
    console.log("Input is empty!");
    return;
  }

  const onPixels = inputEl.value.trim().split(",");
  // onPixels.map((value) => value.replace(/\s/g, ""));

  for (let id = 1; id <= TOTAL_PIXELS; id++) {
    const currentPixel = document.getElementById(`pix${id}`);
    if (!currentPixel) continue;
    if (onPixels.includes(id.toString()) || onPixels.includes(id)) {
      currentPixel.classList.add("pixel-color");
    } else {
      currentPixel.classList.remove("pixel-color");
    }
  }
}

// Get pixel numbers from current design and pass to text box
function getPixelIds() {
  var pixels = [];

  for (let i = 1; i <= TOTAL_PIXELS; i++) {
    const currentPixel = document.getElementById(`pix${i}`);

    if (!currentPixel) {
      console.log("failed:", currentPixel);
      continue;
    }

    const isColored =
      currentPixel.classList.contains("pixel-color") ||
      currentPixel.style.backgroundColor.startsWith("rgba");

    if (isColored) pixels.push(i);
    else console.log(currentPixel);
  }

  if (pixels.length > 0) {
    setInput(pixels.toString());
    console.log("Done");
  } else {
    console.log("Empty");
  }
}

function toggleHelp() {
  const text = `
  Help
  -Draw with the mouse by holding down left-click
  -Hold 'Command' while drawing to erase
  -Click 'Clear' (brush icon) to clear the canvas
  -Click 'Save' (solid disk) to store drawing in web store
  -Click 'Load' (regular disk) to load your saved drawing
  -Click 'Download' (down arrow) to get pixel ID numbers for your current drawing
  -Click 'Pencil' to draw from pixel ID numbers in the text bar
  -Click 'Upload' (up arrow) to load an image file for pixelating
  -Click 'Help' (question mark) for help
  `;

  setInput(text);
}

/*
Black: rgb(0, 0, 0) (no light).
White: rgb(255, 255, 255) (all light).
Red: rgb(255, 0, 0) (full red, no green/blue).
Yellow: rgb(255, 255, 0) (full red and green, no blue).
*/

function updateColor() {
  let c = parseInt(colorSlider.value);
  currentColor = `hsl(${c},100%,50%)`;
  colorSlider.style.backgroundColor = currentColor;
}

// Set text box text
function setInput(text) {
  inputEl.value = text;
}

// Clear the text box
function clearText() {
  setInput("");
}
