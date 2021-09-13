import Popper from '@popperjs/core';
import { createForJQuery } from "./CreateForJQuery.js";
import { defaultPlugins, picksPlugins, allPlugins } from "./PluginSet.js";
import { Bs5Plugin } from "./plugins/Bs5Plugin.js";
import { MultiSelectBuilder } from "./MultiSelectBuilder.js";
import { utilities } from "./ToolSet.js";
import { shallowClearClone } from "./ToolsJs.js";

const BsMultiSelect = /*#__PURE__*/((window, jQuery, globalPopper) => {
  return createForJQuery(window, jQuery, globalPopper, 'BsMultiSelect', defaultPlugins, Bs5Plugin);
})(window, window.jQuery, Popper);

const BsPicks = /*#__PURE__*/((window, jQuery, globalPopper) => {
  return createForJQuery(window, jQuery, globalPopper, 'BsPicks', picksPlugins, Bs5Plugin);
})(window, window.jQuery, Popper);

export default {
  BsMultiSelect,
  BsPicks,
  MultiSelectTools: {
    MultiSelectBuilder,
    plugins: /*#__PURE__*/shallowClearClone({
      Bs5Plugin
    }, allPlugins),
    utilities
  }
};