import $ from 'jquery';
import Popper from 'popper.js';
import { BsMultiSelect } from "./BsMultiSelect.esm.js";
import { BsMultiSelectElement } from "./BsMultiSelectElement.js";
import { LabelPlugin } from "./plugins/LabelPlugin.js";
import { FormResetPlugin } from "./plugins/FormResetPlugin.js";
import { ValidationApiPlugin } from "./plugins/ValidationApiPlugin.js";
import { BsAppearancePlugin } from "./plugins/BsAppearancePlugin.js";
import { HiddenOptionPlugin } from "./plugins/HiddenOptionPlugin.js";
/*
1.
<script src="choicesjs-stencil/dist/choicesjsstencil.js"></script>

2.
<dashboardcode-bsmultiselect values="foo,bar"></choicesjs-stencil>
*/

((window, createPopper) => {
  // was:
  // var elementPrototype = Object.create(HTMLElement.prototype);
  //  elementPrototype.createdCallback = function() { var shadowRoot = this.createShadowRoot();... shadowRoot.appendChild(elem); }
  // elementPrototype.attributeChangedCallback = ...
  // document.registerElement('element-multiplier', {prototype: elementPrototype });
  window.customElements.define('dashboardcode-bsmultiselect', BsMultiSelectElement); // let createPlugin = (element, settings, onDispose) => { 
  //     let trigger = (e, eventName) => $(e).trigger(eventName);
  //     let environment = {trigger, window, Popper}
  //     let multiSelect = BsMultiSelect(element, environment, settings);
  //     multiSelect.onDispose = composeSync(multiSelect.onDispose, onDispose);
  //     return multiSelect;
  // }
  // addToJQueryPrototype('BsMultiSelect', createPlugin, defaults, $);
})(window, createPopper);