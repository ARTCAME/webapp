export default class Rectangle {
    constructor (x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.Contains = function (pt) {
          if (((pt.x >= this.x) && (pt.x <= (this.x + this.width))) &&
            ((pt.y >= this.y) && (pt.y <= (this.y + this.height)))) {
            return true;
          } else {
            return false;
          }
        }
      }
    }
