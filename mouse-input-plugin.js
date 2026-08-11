(function(global){
    'use strict';

    class MouseInputPlugin{
        constructor(){
            this.name = 'mouse';
            this._target = null;
            this._window = null;
            this._pressedButtons = new Set();
            this._notify = function(){};

            this._onMouseDown = this._onMouseDown.bind(this);
            this._onMouseUp = this._onMouseUp.bind(this);
        }

        attach(target, notify){
            this.detach();
            this._target = target;
            this._window = target.ownerDocument ? target.ownerDocument.defaultView : global;
            this._notify = notify;


            target.addEventListener('mousedown', this._onMouseDown);
            target.addEventListener('mouseup', this._onMouseUp);
        }

        detach(){
            if(this._target){
                this._target.removeEventListener('mousedown', this._onMouseDown);}
            if(this.window){
                this._window.removeEventListener('mouseup', this._onMouseUp);
            }
            this._target = null;
            this._window = null;
            this._notify = function(){};
            this.reset();
        }

        reset(){
            this._pressedButtons.clear();
        }

        isActionActive(actionSettings){
            const settings = actionSettings.mouse;
            if(!settings){
                return false;
            }

            const buttons = Array.isArray(settings) ? settings : settings.buttons;
            return Array.isArray(buttons) && buttons.some((button)=>{
                return this._pressedButtons.has(Number(button));
            });
        }

        _onMouseDown(event){
            const button = Number(event.button);
            if( !this._pressedButtons.has(button)){
                this._pressedButtons.add(button);
                this._notify();
            }
        }

        _onKeyUp(event){
            if(this._pressedButtons.delete(Number(event.button))){
                this._notify();
            }
        }
    }
    global.MouseInputPlugin = MouseInputPlugin;

    if(typeof module !== 'undefined' && module.exports){
        module.exports = MouseInputPlugin;
    }
})(typeof window !== 'undefined' ? window : globalThis);