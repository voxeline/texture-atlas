class Rect {
  x: number;
  y: number;
  w: number;
  h: number;

  constructor(x: number, y: number, w: number, h: number) {
    this.x = x; this.y = y;
    this.w = w; this.h = h;
  }

  fitsIn(outer: Rect) {
    return outer.w >= this.w && outer.h >= this.h;
  };

  sameSizeAs(other: Rect) {
    return this.w === other.w && this.h === other.h;
  };

}

export default Rect;
