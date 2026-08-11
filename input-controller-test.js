(function () {
    'use strict';

    const target = document.body;
    const player = document.getElementById('player');
    const playground = document.getElementById('playground');
    const result = document.getElementById('result');
    const controller = new InputController({
        left: { keyboard: { keys: [37, 65] } },
        right: { keyboard: { keys: [39, 68] } },
        up: { keyboard: { keys: [38, 87] } },
        down: { keyboard: { keys: [40, 83] } }
    });

    controller.addPlugin(new KeyboardInputPlugin());
    controller.addPlugin(new MouseInputPlugin());
    controller.attach(target);

    document.getElementById('attach').addEventListener('click', function () {
        controller.attach(target);
        result.textContent = 'Контроллер подключен';
    });

    document.getElementById('detach').addEventListener('click', function () {
        controller.detach();
        player.classList.remove('jump');
        result.textContent = 'Контроллер отключен';
    });

    document.getElementById('enable-controller').addEventListener('click', function () {
        controller.enabled = true;
        result.textContent = 'Контроллер активирован';
    });

    document.getElementById('disable-controller').addEventListener('click', function () {
        controller.enabled = false;
        player.classList.remove('jump');
        result.textContent = 'Контроллер деактивирован';
    });

    document.getElementById('bind-jump').addEventListener('click', function () {
        controller.bindActions({
            jump: {
                keyboard: { keys: [32] },
                mouse: { buttons: [0] }
            }
        });
        result.textContent = 'Экшен jump добавлен';
    });

    document.getElementById('enable-jump').addEventListener('click', function () {
        controller.enableAction('jump');
        result.textContent = 'Экшен jump включен';
    });

    document.getElementById('disable-jump').addEventListener('click', function () {
        controller.disableAction('jump');
        player.classList.remove('jump');
        result.textContent = 'Экшен jump выключен';
    });

    target.addEventListener(controller.ACTION_ACTIVATED, function (event) {
        if (event.detail === 'jump') {
            player.classList.add('jump');
        }
    });

    target.addEventListener(controller.ACTION_DEACTIVATED, function (event) {
        if (event.detail === 'jump') {
            player.classList.remove('jump');
        }
    });

    let positionX = 100;
    let positionY = 0;

    function update() {
        positionX += controller.isActionActive('right') ? 4 : 0;
        positionX -= controller.isActionActive('left') ? 4 : 0;
        positionY += controller.isActionActive('down') ? 4 : 0;
        positionY -= controller.isActionActive('up') ? 4 : 0;

        positionX = Math.max(0, Math.min(
            positionX,
            playground.clientWidth - player.offsetWidth
        ));
        positionY = Math.max(0, Math.min(
            positionY,
            playground.clientHeight - player.offsetHeight
        ));

        player.style.left = positionX + 'px';
        player.style.top = positionY + 'px';
        requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
})();
