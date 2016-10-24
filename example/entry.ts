declare const require: any;

import Promise = require('bluebird');
import { Atlas } from '..';
import { debug } from '../lib/utils';

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
  require(`file!painterly-textures/textures/dirt.png`),
  require(`file!painterly-textures/textures/grass.png`),
  require(`file!painterly-textures/textures/grass_dirt.png`),
  require(`file!painterly-textures/textures/obsidian.png`),
  require(`file!painterly-textures/textures/plank.png`),
  require(`file!painterly-textures/textures/whitewool.png`),
  require(`file!painterly-textures/textures/crate.png`),
  require(`file!painterly-textures/textures/bedrock.png`),
  require(`file!painterly-textures/textures/bluewool.png`),
  require(`file!painterly-textures/textures/cobblestone.png`),
  require(`file!painterly-textures/textures/brick.png`),
  require(`file!painterly-textures/textures/diamond.png`),
  require(`file!painterly-textures/textures/glowstone.png`),
  require(`file!painterly-textures/textures/netherrack.png`),
  require(`file!painterly-textures/textures/redwool.png`),
].forEach(url => {
  promise = promise.then(() => Promise.all([
    wait(300),
    fetchImage(url).then(atlasPack),
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
