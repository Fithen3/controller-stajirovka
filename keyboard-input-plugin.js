(function (global) {
    'use strict';

    class KeyboardInputPlugin {
        constructor() {
            this.name = 'keyboard';
            this._target = null;
            this._pressedKeys = new Set();
            this._notify = function () {};

            this._onKeyDown = this._onKeyDown.bind(this);
            this._onKeyUp = this._onKeyUp.bind(this);
        }

        attach(target, notify) {
            this.detach();
            this._target = target;
            this._notify = notify;
            target.addEventListener('keydown', this._onKeyDown);
            target.addEventListener('keyup', this._onKeyUp);
        }

        detach() {
            if (this._target) {
                this._target.removeEventListener('keydown', this._onKeyDown);
                this._target.removeEventListener('keyup', this._onKeyUp);
            }
            this._target = null;
            this._notify = function () {};
            this.reset();
        }

        reset() {
            this._pressedKeys.clear();
        }

        isActionActive(actionSettings) {
            const settings = actionSettings.keyboard || (
                Array.isArray(actionSettings.keys) ? actionSettings : null
            );
            if (!settings) {
                return false;
            }

            const keys = Array.isArray(settings) ? settings : settings.keys;
            return Array.isArray(keys) && keys.some((keyCode) => {
                return this._pressedKeys.has(Number(keyCode));
            });
        }

        isKeyPressed(keyCode) {
            return this._pressedKeys.has(Number(keyCode));
        }

        _onKeyDown(event) {
            const keyCode = Number(event.keyCode);
            if (Number.isInteger(keyCode) && !this._pressedKeys.has(keyCode)) {
                this._pressedKeys.add(keyCode);
                this._notify();
            }
        }

        _onKeyUp(event) {
            if (this._pressedKeys.delete(Number(event.keyCode))) {
                this._notify();
            }
        }
    }

    global.KeyboardInputPlugin = KeyboardInputPlugin;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = KeyboardInputPlugin;
    }
})(typeof window !== 'undefined' ? window : globalThis);