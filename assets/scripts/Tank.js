var Joystick = require('Joystick');

cc.Class({

    extends: cc.Component,

    properties: {

        joystick: {
            type: Joystick,
            default: null,
        },

        speed: 200,

    },

    start () {
    },

    update (dt) {

        var direction = this.joystick.direction;

        if (direction.x == 0 && direction.y == 0) {
            return;
        }

        this.node.x += this.speed * dt * direction.x;
        this.node.y += this.speed * dt * direction.y;

        // degree = radian * 180 / PI
        var degree = Math.atan2(direction.y, direction.x)  * 180 / Math.PI;
        /*
         * 数学中 0 度沿 X 轴向右，Creator 中 0 度沿 Y 轴向上。 ==> `degree -= 90;`
         * 数学中角度为逆时针，Creator 中角度为顺时针。 ==> `degree = -degree;`
         */
         degree = 90 - degree;
        
 
        this.node.rotation = degree;

    },

});
