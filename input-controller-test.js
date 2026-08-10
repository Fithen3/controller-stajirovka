(function(){
    'use strict';

    const target = document.body;
    const player = document.getElementById('player');
    const playground = document.getElementById('playground');
    const result = document.getElementById('result');
    const attachButton = document.getElementById('attach');
    const detachButton = document.getElementById('detach');
    const enableControllerButton = document.getElementById('enable-controller');
    const disableControllerButton = document.getElementById('disable-controller');
    const JumpButton = document.getElementById('Jump');


    const controller = new InputController({
        left:{
            keys: [37,65]
        },

        right:{
            keys: [39,68]
        }
    }, target);

    let positionX = 100;

    const speed = 4;

    attachButton.addEventListener('click', function(){
        controller.attach(target);

        result.textContent = 'Контроллер подключен';
    });

    detachButton.addEventListener('click', function(){
        controller.detach();

        player.classList.remove('jump');

        result.textContent = 'Контроллер отключен';
    });

    enableControllerButton.addEventListener('click', function(){
        controller.enabled = true;

        result.textContent = 'Контроллер активирован';
    });

    disableControllerButton.addEventListener('click', function(){
        controller.enabled = false;

        player.classList.remove('jump');

        result.textContent = 'Контроллер деактивирован';
    });

    JumpButton.addEventListener('click', function(){
        controller.bindActions({
            jump: {
                keys: [32]
            }
        });
        result.textContent = 'Добавлена активность Jump';
    });

    target.addEventListener(
        controller.ACTION_ACTIVATED,
        function(event){
            if(event.detail === 'jump'){
                player.classList.remove('jump');
            }
        }
    );

    function update(){
        if (controller.isActionActive('left')){
            positionX -= speed;
        }

        if(controller.isActionActive('right')){
            positionX+=speed;
        }

        const maxX = playground.clientWidth-player.offsetWidth;

        if (positionX < 0){
            positionX = 0;
        }

        if(positionX > maxX){
            positionX = maxX;
        }

        player.style.left = positionX + 'px';
        requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
})();
