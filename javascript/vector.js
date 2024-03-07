class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(vector) {
    return new Vector(this.x + vector.x, this.y + vector.y);
  }

  sub(vector) {
    return new Vector(this.x - vector.x, this.y - vector.y);
  }

  mul(n) {
    return new Vector(this.x * n, this.y * n);
  }

  div(n) {
    return new Vector(this.x / n, this.y / n);
  }

  mag() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  normalize() {
    return this.mag() === 0 ? new Vector(0, 0) : this.div(this.mag());
  }
}
