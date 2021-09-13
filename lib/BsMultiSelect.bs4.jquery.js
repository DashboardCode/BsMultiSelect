import $ from 'jquery';
import Popper from 'popper.js';
import { createForJQuery } from "./CreateForJQuery.js";
import { defaultPlugins, picksPlugins, allPlugins } from "./PluginSet.js";
import { Bs4Plugin } from "./plugins/Bs4Plugin.js";
import { MultiSelectBuilder } from "./MultiSelectBuilder.js";
import { utilities } from "./ToolSet.js";
import { shallowClearClone } from "./ToolsJs.js";

const BsMultiSelect = /*#__PURE__*/((window, jQuery, createPopper) => {
  return createForJQuery(window, jQuery, createPopper, 'BsMultiSelect', defaultPlugins, Bs4Plugin);
})(window, $, Popper);

const BsPicks = /*#__PURE__*/((window, jQuery, createPopper) => {
  return createForJQuery(window, jQuery, createPopper, 'BsPicks', picksPlugins, Bs4Plugin);
})(window, $, Popper);

export default {
  BsMultiSelect,
  BsPicks,
  MultiSelectTools: {
    MultiSelectBuilder,
    plugins: /*#__PURE__*/shallowClearClone({
      Bs4Plugin
    }, allPlugins),
    utilities
  }
};