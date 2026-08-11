(function (global) {
    'use strict';

    class InputController {
        constructor(actionsToBind, target, plugins) {
            this._enabled = false;
            this.focused = hasFocus(target);
            this.ACTION_ACTIVATED = 'input-controller:action-activated';
            this.ACTION_DEACTIVATED = 'input-controller:action-deactivated';

            this._target = null;
            this._window = null;
            this._actions = new Map();
            this._actionStates = new Map();
            this._plugins = new Map();

            this._onPluginChange = this._onPluginChange.bind(this);
            this._onWindowBlur = this._onWindowBlur.bind(this);
            this._onWindowFocus = this._onWindowFocus.bind(this);

            (plugins || []).forEach((plugin) => this.addPlugin(plugin));

            if (actionsToBind) {
                this.bindActions(actionsToBind);
            }
            if (target) {
                this.attach(target);
            }
        }

        get enabled() {
            return this._enabled;
        }

        set enabled(value) {
            this._enabled = Boolean(value);
            this._refreshActionStates(false);
        }

        bindActions(actionsToBind) {
            if (!actionsToBind || typeof actionsToBind !== 'object') {
                return;
            }

            Object.keys(actionsToBind).forEach((actionName) => {
                const settings = actionsToBind[actionName];
                if (!settings || typeof settings !== 'object') {
                    return;
                }

                const oldSettings = this._actions.get(actionName) || { enabled: true };
                this._actions.set(
                    actionName,
                    Object.assign({}, oldSettings, settings)
                );
            });

            this._refreshActionStates(false);
        }

        addPlugin(plugin) {
            if (!isPlugin(plugin)) {
                throw new TypeError('Некорректный плагин ввода');
            }

            const oldPlugin = this._plugins.get(plugin.name);
            if (oldPlugin === plugin) {
                return;
            }
            if (oldPlugin) {
                oldPlugin.detach();
            }

            this._plugins.set(plugin.name, plugin);
            if (this._target) {
                plugin.attach(this._target, this._onPluginChange);
            }
            this._refreshActionStates(false);
        }

        enableAction(actionName) {
            const action = this._actions.get(actionName);
            if (action) {
                action.enabled = true;
                this._refreshActionStates(false);
            }
        }

        disableAction(actionName) {
            const action = this._actions.get(actionName);
            if (action) {
                action.enabled = false;
                this._refreshActionStates(false);
            }
        }

        attach(target, dontEnable) {
            if (!target || typeof target.addEventListener !== 'function') {
                return;
            }

            this._removeListeners();
            this._target = target;
            this._window = getWindow(target);
            this.focused = hasFocus(target);

            if (this._window) {
                this._window.addEventListener('blur', this._onWindowBlur);
                this._window.addEventListener('focus', this._onWindowFocus);
            }
            this._plugins.forEach((plugin) => {
                plugin.attach(target, this._onPluginChange);
            });

            if (dontEnable !== true) {
                this.enabled = true;
            }
        }

        detach() {
            this.enabled = false;
            this._removeListeners();
            this._target = null;
            this._window = null;
            this.focused = false;
        }

        isActionActive(actionName) {
            const action = this._actions.get(actionName);
            if (!this.enabled || !this.focused || !action || action.enabled === false) {
                return false;
            }

            for (const plugin of this._plugins.values()) {
                if (plugin.isActionActive(action, actionName)) {
                    return true;
                }
            }
            return false;
        }

        isKeyPressed(keyCode) {
            const keyboard = this._plugins.get('keyboard');
            return Boolean(
                this.focused &&
                keyboard &&
                typeof keyboard.isKeyPressed === 'function' &&
                keyboard.isKeyPressed(keyCode)
            );
        }

        _onPluginChange() {
            this._refreshActionStates(true);
        }

        _refreshActionStates(shouldDispatch) {
            this._actions.forEach((action, actionName) => {
                const wasActive = this._actionStates.get(actionName) === true;
                const isActive = this.isActionActive(actionName);
                this._actionStates.set(actionName, isActive);

                if (!shouldDispatch || wasActive === isActive) {
                    return;
                }
                this._dispatchActionEvent(
                    isActive ? this.ACTION_ACTIVATED : this.ACTION_DEACTIVATED,
                    actionName
                );
            });
        }

        _dispatchActionEvent(eventName, actionName) {
            if (!this._target || !this.enabled || !this.focused) {
                return;
            }

            const ownerWindow = getWindow(this._target);
            const CustomEventClass = (ownerWindow && ownerWindow.CustomEvent) || global.CustomEvent;
            this._target.dispatchEvent(new CustomEventClass(eventName, {
                detail: actionName
            }));
        }

        _onWindowBlur() {
            this.focused = false;
            this._plugins.forEach((plugin) => {
                if (typeof plugin.reset === 'function') {
                    plugin.reset();
                }
            });
            this._refreshActionStates(false);
        }

        _onWindowFocus() {
            this.focused = true;
            this._refreshActionStates(false);
        }

        _removeListeners() {
            if (this._window) {
                this._window.removeEventListener('blur', this._onWindowBlur);
                this._window.removeEventListener('focus', this._onWindowFocus);
            }
            this._plugins.forEach((plugin) => plugin.detach());
        }
    }

    function isPlugin(plugin) {
        return plugin &&
            typeof plugin.name === 'string' &&
            typeof plugin.attach === 'function' &&
            typeof plugin.detach === 'function' &&
            typeof plugin.isActionActive === 'function';
    }

    function getWindow(target) {
        return target && target.ownerDocument
            ? target.ownerDocument.defaultView
            : global;
    }

    function hasFocus(target) {
        const documentObject = target && target.ownerDocument
            ? target.ownerDocument
            : global.document;
        return !documentObject || typeof documentObject.hasFocus !== 'function'
            ? true
            : documentObject.hasFocus();
    }

    global.InputController = InputController;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = InputController;
    }
})(typeof window !== 'undefined' ? window : globalThis);
