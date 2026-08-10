(function (global) {
    'use strict';

    class InputController{
        constructor(actionsToBind, target){
            this.enabled = false;
            this.focused = document.hasFocus();

            Object.defineProperties(this, {
                ACTION_ACTIVATED: {
                    value: 'input-controller:active-activated',
                    writable: false,
                    configurable: false
                },

                ACTION_DEACTIVATED: {
                    value: 'input-controller:active-deactivated',
                    writable: false,
                    configurable: false
                }
            });
            this._target = null;
            this._actions = new Map();
            this._pressedKeys = new Set();
            
            this._onKeyDown = this._onKeyDown.bind(this);
            this._onKeyUp = this._onKeyUp.bind(this);
            this._onWindowBlur = this._onWindowBlur.bind(this);
            this._onWindowFocus = this._onWindowFocus.bind(this);

            if(actionsToBind){
                this.bindActions(actionsToBind);
            }

            if(target){
                this.attach(target);
            }
        }

        bindActions(actionsToBind){
            if(!actionsToBind || typeof actionsToBind !== 'object'){
                return;
            }

            Object.keys(actionsToBind).forEach((actionName) => {
                const config = actionsToBind[actionName];

                if(!config || !Array.isArray(config.keys)){
                    return;
                }

                let action = this._actions.get(actionName);
                if(!action){
                    action = {
                        keys: new Set(),
                        enabled: true
                    };
                    this._actions.set(actionName, action)
                }
                config.keys.forEach((keyCode) => {
                    const code = Number(keyCode);

                    if(Number.isInteger(code)){
                        action.keys.add(code);
                    }
                });

                if(typeof config.enabled === 'boolean'){
                    action.enabled = config.enabled;
                }
            });
        }
        
        enableAction(actionName){
            const action = this._actions.get(actionName);

            if (!action){
                return;
            }
            action.enabled = true;
        }

        disableAction(actionName){
            const action = this._actions.get(actionName);

            if(!action){
                return;
            }

            action.enabled = false;
        }

        attach(target, dontEnable){
            if(!target || typeof target.addEventListener !== 'function'){
                return;
            }

            if(this._target){
                this._removeListeners();
            }

            this._target = target;
            this._target.addEventListener('keydown', this._onKeyDown);
            this._target.addEventListener('keyup', this._onKeyUp);

            window.addEventListener('blur', this._onWindowBlur);
            window.addEventListener('focus', this._onWindowFocus);

            this.focused = document.hasFocus();

            if(dontEnable !== true){
                this.enabled = true;
            }
        }

        detach(){
            this._removeListeners();
            this._pressedKeys.clear();
            this.enabled = false;
            this._target = null;
        }

        isActionActive(actionName){
            if(!this.enabled || !this.focused){
                return false;
            }
            
            const action = this._actions.get(actionName);

            if (!action || !action.enabled){
                return false;
            }

            for (const keyCode of action.keys){
                if (this._pressedKeys.has(keyCode)){
                    return true;
                }
            }
            return false;
        }

        isKeyPressed(keyCode){
            if(!this.focused){
                return false;
            }

            return this._pressedKeys.has(Number(keyCode));
        }

        _onKeyDown(event){
            if(!this.focused){
                return;
            }

            const keyCode = event.keyCode;

            if(this._pressedKeys.has(keyCode)){
                return;
            }

            const previousStates = this._getActionStatesByKey(keyCode);

            this._pressedKeys.add(keyCode);

            if (!this.enabled){
                return;
            }

            previousStates.forEach((wasActive, actionName) => {
                const action = this._actions.get(actionName);

                if(!action || !action.enabled){
                    return
                }

                const isActive = this.isActionActive(actionName);

                if(!wasActive && isActive){
                    this._dispatchActionEvent(
                        this.ACTION_ACTIVATED,
                        actionName
                    );
                }
            });
        }

        _onKeyUp(event){
            if(!this.focused){
                return;
            }

            const keyCode = event.keyCode;

            if(!this._pressedKeys.has(keyCode)){
                return;
            }

            const previousStates = this._getActionStatesByKey(keyCode);

            this._pressedKeys.delete(keyCode);

            if(!this.enabled){
                return;
            }

            previousStates.forEach((wasActive, actionName) => {
                const action = this._actions.get(actionName);

                if(!action || !action.enabled){
                    return;
                }

                const isActive = this.isActionActive(actionName);

                if(wasActive && !isActive){
                    this._dispatchActionEvent(
                        this.ACTION_DEACTIVATED,
                        actionName
                    );
                }
            });
        }

        _getActionStatesByKey(keyCode){
            const states = new Map();

            this._actions.forEach((action,actionName) => {
                if(action.keys.has(keyCode)){
                    states.set(
                        actionName,
                        this.isActionActive(actionName)
                    );
                }
            });
            return states;
        }

        _dispatchActionEvent(eventName, actionName){
            if(
                !this._target ||
                !this.enabled ||
                !this.focused
            ){
                return;
            }

            const event = new CustomEvent(eventName, {
                detail: actionName
            });

            this._target.dispatchEvent(event);
        }

        _onWindowBlur(){
            this.focused = false;

            this._pressedKeys.clear();
        }

        _onWindowFocus(){
            this.focused = true;

            this._pressedKeys.clear();
        }

        _removeListeners(){
            if(this._target){
                this._target.removeEventListener(
                    'keydown',
                    this._onKeyDown
                );

                this._target.removeEventListener(
                    'keyup',
                    this._onKeyUp
                );
            }

            window.removeEventListener(
                'blur',
                this._onWindowBlur
            );

            window.removeEventListener(
                'focus',
                this._onWindowFocus
            );
        }
    }
    global.InputController = InputController;

})(window);
