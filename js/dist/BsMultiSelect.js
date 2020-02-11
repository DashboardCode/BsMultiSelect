import $ from 'jquery';
import Popper from 'popper.js';
import { addToJQueryPrototype } from './AddToJQueryPrototype';
import { BsMultiSelectGenerator, defaults } from './BsMultiSelectGenerator';

(function (window, $, Popper) {
  var createPlugin = function createPlugin(element, settings, onDispose) {
    var trigger = function trigger(eventName) {
      return $(element).trigger(eventName);
    };

    return BsMultiSelectGenerator(element, settings, onDispose, trigger, window, Popper);
  };

  addToJQueryPrototype('BsMultiSelect', createPlugin, defaults, $);
})(window, $, Popper);

//# sourceMappingURL=BsMultiSelect.js.map