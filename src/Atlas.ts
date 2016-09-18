import Rect from './Rect';

export type Drawable = HTMLImageElement | HTMLCanvasElement;

function createTiledImage(img: Drawable) {
  const p = img.width / 2;

  const canvas = document.createElement('canvas');
  canvas.id = img.id || '';
  canvas.width = img.width + img.width;
  canvas.height = img.height + img.height;
  const context = canvas.getContext('2d');

  const pattern = context.createPattern(img, 'repeat');
  context.fillStyle = pattern;
  context.translate(p, p);
  context.fillRect(-p, -p, canvas.width + p, canvas.height + p);
  context.translate(-p, -p);

  return canvas;
}

function makeUv(node: AtlasNode, tilepad: boolean, w: number, h: number) {
  const p = tilepad ? node.rect.w / 4 : 0;
  return [
    [node.rect.x + p, node.rect.y + p],
    [(node.rect.x + p) + (node.rect.w - (p * 2)), node.rect.y + p],
    [(node.rect.x + p) + (node.rect.w - (p * 2)), (node.rect.y + p) + (node.rect.h - (p * 2))],
    [(node.rect.x + p), (node.rect.y + p) + (node.rect.h - (p * 2))],
  ].map((uv) => {
    if (uv[0] !== 0) {
      uv[0] = uv[0] / w;
    }
    if (uv[1] !== 0) {
      uv[1] = uv[1] / h;
    }
    return uv;
  });
}

function makeUv2(node: AtlasNode, tilepad: boolean, w: number, h: number) {
  const p = tilepad ? node.rect.w / 4 : 0;
  const uv = new Float32Array(8);
  uv[0] = (node.rect.x + p) / w;
  uv[1] = (node.rect.y + p) / h;
  uv[2] = ((node.rect.x + p) + (node.rect.w - (p * 2))) / w;
  uv[3] = (node.rect.y + p) / h;
  uv[4] = ((node.rect.x + p) + (node.rect.w - (p * 2))) / w;
  uv[5] = ((node.rect.y + p) + (node.rect.h - (p * 2))) / h;
  uv[6] = (node.rect.x + p) / w;
  uv[7] = ((node.rect.y + p) + (node.rect.h - (p * 2))) / h;
  return uv;
}

export class AtlasNode {
  left: AtlasNode;
  right: AtlasNode;
  rect: Rect;
  filled: boolean;

  constructor(x: number, y: number, w: number, h: number) {
    this.left = this.right = null;
    this.rect = new Rect(x, y, w, h);
    this.filled = false;
  }

  pack(rect: Rect): AtlasNode {
    if (this.left !== null) {
      return this.left.pack(rect) || this.right.pack(rect);
    }

    // if atlas filled or wont fit
    if (this.filled || !rect.fitsIn(this.rect)) {
      return null;
    }

    // if this atlas has been filled
    if (rect.sameSizeAs(this.rect)) {
      this.filled = true;
      return this;
    }

    if ((this.rect.w - rect.w) > (this.rect.h - rect.h)) {
      this.left = new AtlasNode(this.rect.x, this.rect.y, rect.w, this.rect.h);
      this.right = new AtlasNode(this.rect.x + rect.w, this.rect.y, this.rect.w - rect.w, this.rect.h);
    } else {
      this.left = new AtlasNode(this.rect.x, this.rect.y, this.rect.w, rect.h);
      this.right = new AtlasNode(this.rect.x, this.rect.y + rect.h, this.rect.w, this.rect.h - rect.h);
    }

    return this.left.pack(rect);
  }
}

export interface AtlasOptions {
  tilepad?: boolean;
}

export interface RectIndex {
  [index: string]: Rect;
}

export interface UvIndex {
  [index: string]: number[][];
}

export interface UvIndex2 {
  [index: string]: Float32Array;
}

class Atlas {
  tilepad: boolean;

  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  private _rootNode: AtlasNode;

  private _terminalNodes: { [index: string]: AtlasNode };
  private _uvs: UvIndex;
  private _uvs2: UvIndex2;

  constructor(canvas: HTMLCanvasElement, options: AtlasOptions = {}) {
    this.tilepad = options.tilepad || false;

    this.canvas = canvas;
    this.context = canvas.getContext('2d');

    this._rootNode = new AtlasNode(0, 0, this.canvas.width, this.canvas.height);

    this._terminalNodes = {};
    this.invalidateUvIndices();
  }

  pack(id: string, img: Drawable) {
    this._checkId(id);
    return this._pack(id, this.tilepad ? createTiledImage(img) : img);
  }

  expand(id: string, img: Drawable) {
    this._checkId(id);
    this.invalidateUvIndices();
    return this._expand(id, this.tilepad ? createTiledImage(img) : img);
  }

  index() {
    return Object.keys(this._terminalNodes).map(key => this._terminalNodes[key].rect);
  };

  uv() {
    if (this._uvs) return this._uvs;

    this._uvs = this.buildUvIndex();
    return this._uvs;
  };

  uv2() {
    if (this._uvs2) return this._uvs2;

    this._uvs2 = this.buildUvIndex2();
    return this._uvs2;
  };

  private invalidateUvIndices() {
    this._uvs = null;
    this._uvs2 = null;
  }

  private _checkId(id: string) {
    if (this._terminalNodes[id]) throw new Error(`Duplicated texture id ${id}`);
  }

  private _pack(id: string, img: Drawable) {
    const rect = new Rect(0, 0, img.width, img.height);

    const node = this._rootNode.pack(rect);
    if (!node) return null;

    this._ontoCanvas(id, img, node.rect);
    this._terminalNodes[id] = node;

    if (this._uvs) this._uvs[id] = makeUv(node, this.tilepad, this.canvas.width, this.canvas.height);
    if (this._uvs2) this._uvs2[id] = makeUv2(node, this.tilepad, this.canvas.width, this.canvas.height);
    return node;
  }

  private _expand(id: string, img: Drawable): Atlas {
    const rect = new Rect(0, 0, img.width, img.height);

    const backup = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);

    let right: AtlasNode;

    if (this._rootNode.rect.w < this._rootNode.rect.h) {
      this.canvas.width = this._rootNode.rect.w + rect.w;
      right = new AtlasNode(this._rootNode.rect.w, 0, rect.w, this._rootNode.rect.h);
    } else {
      this.canvas.height = this._rootNode.rect.h + rect.h;
      right = new AtlasNode(0, this._rootNode.rect.h, this._rootNode.rect.w, rect.h);
    }

    this.context.putImageData(backup, 0, 0);

    const left = this._rootNode;
    this._rootNode = new AtlasNode(0, 0, this.canvas.width, this.canvas.height);
    this._rootNode.left = left;
    this._rootNode.right = right;

    return this._pack(id, img) ? this : this._expand(id, img);
  };

  private buildUvIndex() {
    const uvs: UvIndex = {};
    Object.keys(this._terminalNodes).map(id => {
      const node = this._terminalNodes[id];
      uvs[id] = makeUv(node, this.tilepad, this.canvas.width, this.canvas.height);
    });
    return uvs;
  }

  private buildUvIndex2() {
    const uvs2: UvIndex2 = {};
    Object.keys(this._terminalNodes).map(id => {
      const node = this._terminalNodes[id];
      uvs2[id] = makeUv2(node, this.tilepad, this.canvas.width, this.canvas.height);
    });
    return uvs2;
  }

  // if has an image and canvas, draw to the canvas as we go
  private _ontoCanvas(id: string, img: Drawable, rect: Rect) {
    this.context.clearRect(rect.x, rect.y, rect.w, rect.h);
    this.context.drawImage(img, rect.x, rect.y, rect.w, rect.h);
  };
}

export default Atlas;
