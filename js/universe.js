function fireflies() {
    // 兼容不同的浏览器前缀
    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

    var canvas = document.getElementById("universe"),
        ctx = canvas.getContext("2d"),
        fireflies = [],
        numFireflies = 50, // 萤火虫的数量
        fireflySpeed = 0.2, // 萤火虫的速度
        fireflySize = 1, // 萤火虫的大小
        fireflyOpacityMin = 0.2, // 萤火虫的最小透明度
        fireflyOpacityMax = 0.5; // 萤火虫的最大透明度

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener("resize", function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    function Firefly() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.dx = (Math.random() < 0.5 ? -1 : 1) * fireflySpeed;
        this.dy = (Math.random() < 0.5 ? -1 : 1) * fireflySpeed;
        this.color = "rgba(255, 215, 0, " + (Math.random() * (fireflyOpacityMax - fireflyOpacityMin) + fireflyOpacityMin) + ")"; // 萤火虫的颜色和调整后的透明度
        this.flashing = false; // 是否正在闪烁
        this.flashSpeed = Math.random() * 0.2 + 0.5; // 闪烁速度减小
    }

    Firefly.prototype.update = function() {
        this.x += this.dx;
        this.y += this.dy;

        // 边界检查
        if (this.x < 0 || this.x > canvas.width) this.dx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.dy *= -1;
    };

    Firefly.prototype.draw = function() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, fireflySize, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
    };

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // 清除画布

        for (var i = 0; i < fireflies.length; i++) {
            var firefly = fireflies[i];
            firefly.update();
            firefly.draw();
        }

        requestAnimationFrame(animate);
    }

    // 创建萤火虫
    for (var i = 0; i < numFireflies; i++) {
        fireflies.push(new Firefly());
    }

    animate(); // 开始动画
}

fireflies();