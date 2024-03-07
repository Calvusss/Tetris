const canvas_joystick = document.getElementById("joystick");
const context_joystick = canvas_joystick.getContext("2d");

canvas_joystick.width = 400;
canvas_joystick.height = 550;
// let width = (canvas_joystick.width = innerWidth);
// let height = (canvas_joystick.height = innerHeight);


function circle(pos, radius, color) {
  context_joystick.shadowColor = "grey";
  context_joystick.shadowBlur = 5;

  context_joystick.beginPath();
  context_joystick.fillStyle = color;
  context_joystick.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
  context_joystick.fill();
  context_joystick.closePath();
}

class Joystick {
  constructor(x, y, radius, handleRadius) {
    this.pos = new Vector(x, y);
    this.origin = new Vector(x, y);
    this.radius = radius;
    this.handleRadius = handleRadius;
    this.handleFriction = 0.25;
    this.ondrag = false;
    this.touchPos = new Vector(0, 0);
    this.listener();
  }
  listener() {
    // Touch Events
    addEventListener("touchstart", (e) => {
      this.touchPos = new Vector(e.touches[0].pageX, e.touches[0].pageY);
      if (this.touchPos.sub(this.origin).mag() <= this.radius)
        this.ondrag = true;
    });
    addEventListener("touchend", () => {
      this.ondrag = false;
    });
    addEventListener("touchmove", (e) => {
      this.touchPos = new Vector(e.touches[0].pageX, e.touches[0].pageY);
    });

    // Mouse Events
    addEventListener("mousedown", (e) => {
      this.touchPos = new Vector(e.pageX, e.pageY);
      if (this.touchPos.sub(this.origin).mag() <= this.radius)
        this.ondrag = true;
    });
    addEventListener("mouseup", () => {
      this.ondrag = false;
    });
    addEventListener("mousemove", (e) => {
      this.touchPos = new Vector(e.pageX, e.pageY);
    });
  }

  reposition() {
    if (this.ondrag == false) {
      this.pos = this.pos.add(
        this.origin.sub(this.pos).mul(this.handleFriction)
      );
    } else {
      const diff = this.touchPos.sub(this.origin);
      const maxDist = Math.min(diff.mag(), this.radius);
      this.pos = this.origin.add(diff.normalize().mul(maxDist));
    }
  }

  draw() {
    // Draw Joystick
    circle(this.origin, this.radius, "#707070");
    // Draw Handle
    circle(this.pos, this.handleRadius, "#3d3d3d");
  }

  update() {
    this.reposition();
    this.draw();
  }
}

// Joystick
let joystick = new Joystick(325, 325, 50, 25);
