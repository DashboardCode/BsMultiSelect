import $ from 'jquery'
import Popper from 'popper.js'
import {BsMultiSelect}  from './BsMultiSelect.esm'

import {BsMultiSelectElement} from './BsMultiSelectElement';

import {LabelPlugin} from './plugins/LabelPlugin';
import {FormResetPlugin} from './plugins/FormResetPlugin';
import {ValidationApiPlugin} from './plugins/ValidationApiPlugin';
import {BsAppearancePlugin} from './plugins/BsAppearancePlugin';
import {HiddenOptionPlugin} from './plugins/HiddenOptionPlugin';

/*
1.
<script src="choicesjs-stencil/dist/choicesjsstencil.js"></script>

2.
<dashboardcode-bsmultiselect values="foo,bar"></choicesjs-stencil>
*/

(
    (window, Popper) => {
        // was:
        // var elementPrototype = Object.create(HTMLElement.prototype);
        //  elementPrototype.createdCallback = function() { var shadowRoot = this.createShadowRoot();... shadowRoot.appendChild(elem); }
        // elementPrototype.attributeChangedCallback = ...
        // document.registerElement('element-multiplier', {prototype: elementPrototype });
        window.customElements.define('dashboardcode-bsmultiselect', BsMultiSelectElement);
        // let createPlugin = (element, settings, onDispose) => { 
        //     let trigger = (e, eventName) => $(e).trigger(eventName);
        //     let environment = {trigger, window, Popper}
        //     let multiSelect = BsMultiSelect(element, environment, settings);
        //     multiSelect.onDispose = composeSync(multiSelect.onDispose, onDispose);
        //     return multiSelect;
        // }
        // addToJQueryPrototype('BsMultiSelect', createPlugin, defaults, $);
    }
)(window, Popper)
