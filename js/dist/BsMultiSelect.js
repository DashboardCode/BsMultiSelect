import { MultiSelect } from './MultiSelect';
import { PluginManager, staticDomDefaults } from './PluginManager';
import { composeSync, def } from './ToolsJs';
import { pickContentGenerator as defPickContentGenerator } from './PickContentGenerator';
import { choiceContentGenerator as defChoiceContentGenerator } from './ChoiceContentGenerator';
import { StaticDomFactory } from './StaticDomFactory';
import { PicksDom } from './PicksDom';
import { ChoicesDom } from './ChoicesDom';
import { PopupAspect as DefaultPopupAspect } from './PopupAspect';
import { ComponentAspect } from './ComponentAspect';
import { DataSourceAspect } from './DataSourceAspect';
export function BsMultiSelect(element, environment, configuration, onInit) {
  var Popper = environment.Popper,
      window = environment.window,
      plugins = environment.plugins;

  var trigger = function trigger(eventName) {
    return environment.trigger(element, eventName);
  };

  if (typeof Popper === 'undefined') {
    throw new Error("BsMultiSelect: Popper.js (https://popper.js.org) is required");
  }

  var containerClass = configuration.containerClass,
      css = configuration.css,
      options = configuration.options,
      getDisabled = configuration.getDisabled,
      getSelected = configuration.getSelected,
      setSelected = configuration.setSelected,
      getIsOptionDisabled = configuration.getIsOptionDisabled,
      common = configuration.common;
  if (!common) common = {};
  var dataSourceAspect = DataSourceAspect(options, getSelected, setSelected, getIsOptionDisabled);
  var componentAspect = ComponentAspect(getDisabled, trigger);
  common.getDisabled = componentAspect.getDisabled;
  var PopupAspect = def(configuration.staticContentGenerator, DefaultPopupAspect); // TODO: rename configuration.staticContentGenerator

  var createElement = function createElement(name) {
    return window.document.createElement(name);
  };

  var choicesDom = ChoicesDom(createElement, css);
  var staticDomFactory = StaticDomFactory(createElement, choicesDom.choicesElement);
  staticDomDefaults(plugins, staticDomFactory); // manipulates with staticDomFactory.staticDomGenerator

  var _staticDomFactory$sta = staticDomFactory.staticDomGenerator(element, containerClass),
      staticDom = _staticDomFactory$sta.staticDom,
      staticManager = _staticDomFactory$sta.staticManager; // TODO get picksDom and choicesDom from staticDomFactory


  var picksDom = PicksDom(staticDom.picksElement, createElement, css);
  var popupAspect = PopupAspect(choicesDom.choicesElement, picksDom.filterInputElement, Popper);

  if (!staticDom.ownPicksElement) {
    // some kind of optimization with abstraction leak: if we remove - everithing is disposed
    staticManager.dispose = composeSync(staticManager.dispose, picksDom.dispose);
  }

  var pluginData = {
    environment: environment,
    trigger: trigger,
    configuration: configuration,
    dataSourceAspect: dataSourceAspect,
    componentAspect: componentAspect,
    staticDom: staticDom,
    picksDom: picksDom,
    choicesDom: choicesDom,
    popupAspect: popupAspect,
    staticManager: staticManager,
    common: common
  }; // TODO: replace common with something new? 

  var pluginManager = PluginManager(plugins, pluginData);
  var pickContentGenerator = def(configuration.pickContentGenerator, defPickContentGenerator);
  var choiceContentGenerator = def(configuration.choiceContentGenerator, defChoiceContentGenerator);
  var multiSelect = new MultiSelect(dataSourceAspect, componentAspect, picksDom, choicesDom, staticManager, popupAspect, function (pickElement) {
    return pickContentGenerator(pickElement, common, css);
  }, function (choiceElement, toggle) {
    return choiceContentGenerator(choiceElement, common, css, toggle);
  }, window);
  pluginManager.afterConstructor(multiSelect);
  multiSelect.dispose = composeSync(pluginManager.dispose, multiSelect.dispose.bind(multiSelect));
  onInit == null ? void 0 : onInit(multiSelect);
  multiSelect.init();
  multiSelect.load();
  return multiSelect;
}

//# sourceMappingURL=BsMultiSelect.js.map