import Promise = require('bluebird');
import { Atlas } from '../src/index.ts';
import { debug } from '../src/utils';

// create a canvas
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
canvas.width = 128;
canvas.height = 128;

const tilepad = false;

// create an atlas with our canvas
let atlas = new Atlas(canvas, { tilepad });

let textureId = 0;
function atlasPack(img: HTMLImageElement) {
  const id = `${textureId++}`;
  const node = atlas.pack(id, img);
  if (!node) atlas.expand(id, img);
  debug(atlas);
}

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchImage(url: string) {
  return new Promise<any>((resolve) => {
    const img = new Image();
    img.id = name;
    img.src = url;
    img.onload = () => resolve(img);
  });
}

let promise = <Promise<any>> Promise.resolve();

// add images to our atlas
[
  'dirt', 'grass', 'grass_dirt',
  'obsidian', 'plank', 'whitewool',
  'crate',
  'bedrock', 'bluewool', 'cobblestone',
  'brick', 'diamond', 'glowstone',
  'netherrack', 'redwool',
].forEach(name => {
  promise = promise.then(() => Promise.all([
    wait(300),
    fetchImage(`node_modules/painterly-textures/textures/${name}.png`).then(atlasPack),
  ]));
});

// handle drag and drop
if (typeof FileReader === 'undefined') {
  alert('Sorry your browser doesn\'t support drag and drop files.');
}

canvas.addEventListener('dragover', (e) => {
  e.preventDefault();

  canvas.className = 'active';
  return false;
});

canvas.addEventListener('dragend', (e) => {
  e.preventDefault();

  canvas.className = '';
  return false;
});

canvas.addEventListener('drop', (e) => {
  e.preventDefault();

  canvas.className = '';

  for (let i = 0, len = e.dataTransfer.files.length; i < len; ++i) {
    const file = e.dataTransfer.files[i];
    if (!(file instanceof File)) continue;

    const reader = new FileReader();
    reader.onload = ({ target }) => {
      const img = new Image();
      img.src = (<FileReader> target).result;
      img.onload = () => atlasPack(img);
    };
    reader.readAsDataURL(file);
  }

  return false;
});

// handle exporting atlas
document.querySelector('#export').addEventListener('click', (e) => {
  e.preventDefault();

  window.open(canvas.toDataURL());
  return false;
});

// reset atlas
document.querySelector('#reset').addEventListener('click', (e) => {
  e.preventDefault();

  if (window.confirm('Are you sure?')) {
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 128; canvas.height = 128;
    atlas = new Atlas(canvas, { tilepad });
  }
  return false;
});
