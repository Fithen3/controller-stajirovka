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
        up:{
            keys: [38,87]
        }
        down:{
            keys: [40,83]
        }
    }, target);

    let positionX = 100;
    let positionY = 0;

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
                player.classList.add('jump');
            }
        }
    );
    target.addEventListener(
        controller.ACTION_DEACTIVATED,
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

        if(controller.isActionActive('up')){
            positionY-=speed;
        }

        if(controller.isActionActive('down')){
            positionY+=speed;
        }

        const maxX = playground.clientWidth-player.offsetWidth;
        const maxY = playground.clientHeight-player.offsetHeight;

        if (positionX < 0){
            positionX = 0;
        }

        if (positionY < 0){
            positionY = 0;
        }

        if(positionY > maxY){
            positionY = maxY;
        }

        player.style.left = positionX + 'px';
        player.style.top = positionY + 'px';
        requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
})();
