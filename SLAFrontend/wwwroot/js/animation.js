

const animCtl = {
    points: [],
    velocity2: 5, // velocity squared
    canvas: null,
    radius: 5,
    boundaryX: 760,
    boundaryY: 700,
    numberOfPoints: 30,
    createPoint: function () {
        var point = {}, vx2, vy2;
        point.x = Math.random() * animCtl.boundaryX;
        point.y = Math.random() * animCtl.boundaryY;
        // random vx 
        point.vx = (Math.floor(Math.random()) * 2 - 1) * Math.random();
        vx2 = Math.pow(point.vx, 2);
        // vy^2 = velocity^2 - vx^2
        vy2 = animCtl.velocity2 - vx2;
        point.vy = Math.sqrt(vy2) * (Math.random() * 2 - 1);
        animCtl.points.push(point);
    },
    resetVelocity: function (point, axis, dir) {
        var vx, vy;
        if (axis == 'x') {
            point.vx = dir * Math.random();
            vx2 = Math.pow(point.vx, 2);
            // vy^2 = velocity^2 - vx^2
            vy2 = animCtl.velocity2 - vx2;
            point.vy = Math.sqrt(vy2) * (Math.random() * 2 - 1);
        } else {
            point.vy = dir * Math.random();
            vy2 = Math.pow(point.vy, 2);
            // vy^2 = velocity^2 - vx^2
            vx2 = animCtl.velocity2 - vy2;
            point.vx = Math.sqrt(vx2) * (Math.random() * 2 - 1);
        }
    },
    drawLine: function (x1, y1, x2, y2) {
        animCtl.context.beginPath();
        animCtl.context.moveTo(x1, y1);
        animCtl.context.lineTo(x2, y2);
        animCtl.context.strokeStyle = '#8ab2d8'
        animCtl.context.stroke();
    },
    drawCircle: function (x, y) {
        animCtl.context.beginPath();
        animCtl.context.arc(x, y, animCtl.radius, 0, 2 * Math.PI, false);
        animCtl.context.fillStyle = '#97badc';
        animCtl.context.fill();
    },
    draw: function () {
        for (var i = 0, l = animCtl.points.length; i < l; i++) {
            // circles
            var point = animCtl.points[i];
            point.x += point.vx;
            point.y += point.vy;
            animCtl.drawCircle(point.x, point.y);
            // lines
            animCtl.drawLine(point.x, point.y, point.buddy.x, point.buddy.y);
            // check for edge
            if (point.x < 0 + animCtl.radius) {
                animCtl.resetVelocity(point, 'x', 1);
            } else if (point.x > animCtl.boundaryX - animCtl.radius) {
                animCtl.resetVelocity(point, 'x', -1);
            } else if (point.y < 0 + animCtl.radius) {
                animCtl.resetVelocity(point, 'y', 1);
            } else if (point.y > animCtl.boundaryY - animCtl.radius) {
                animCtl.resetVelocity(point, 'y', -1);
            }
        }
    },
    animate: function () {
        animCtl.context.clearRect(0, 0, 760, 700);
        animCtl.draw();
        requestAnimationFrame(animCtl.animate);
    },

    init: function () {
        animCtl.canvas = document.getElementById('animationContainer');
        animCtl.context = animCtl.canvas.getContext('2d');        
        // create animCtl.points
        for (var i = 0; i < animCtl.numberOfPoints; i++) {
            animCtl.createPoint();
        }
        // create connections
        for (var i = 0, l = animCtl.points.length; i < l; i++) {
            var point = animCtl.points[i];
            if (i == 0) {
                animCtl.points[i].buddy = animCtl.points[animCtl.points.length - 1];
            } else {
                animCtl.points[i].buddy = animCtl.points[i - 1];
            }
        }
        // animate
        animCtl.animate();
    }
};



window.animCtl = animCtl;






