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
import { DoublyLinkedCollection } from './ToolsJs';
import { FilterListAspect, ChoicesGetNextAspect, ChoicesEnumerableAspect } from './FilterListAspect';
import { ChoicesElementAspect, ChoiceFactoryAspect, ChoicesAspect } from './ChoicesAspect';
import { OptionToggleAspect, OptionAspect } from './OptionAspect.js';
import { Choices } from './Choices';
import { ChoicesHover } from './ChoicesHover';
import { Picks } from './Picks';
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
      staticManager = _staticDomFactory$sta.staticManager; // TODO get picksDom  from staticDomFactory


  var picksDom = PicksDom(staticDom.picksElement, staticDom.disposablePicksElement, createElement, css);
  var popupAspect = PopupAspect(choicesDom.choicesElement, picksDom.filterInputElement, Popper);
  var collection = DoublyLinkedCollection(function (choice) {
    return choice.itemPrev;
  }, function (choice, v) {
    return choice.itemPrev = v;
  }, function (choice) {
    return choice.itemNext;
  }, function (choice, v) {
    return choice.itemNext = v;
  });
  var choicesGetNextAspect = ChoicesGetNextAspect(function () {
    return collection.getHead();
  }, function (choice) {
    return choice.itemNext;
  });
  var choicesEnumerableAspect = ChoicesEnumerableAspect(choicesGetNextAspect);
  var filterListAspect = FilterListAspect(choicesGetNextAspect, choicesEnumerableAspect); // TODO move to fully index collection

  var choices = Choices(collection, function () {
    return filterListAspect.filterListFacade_reset();
  }, function (c) {
    return filterListAspect.filterListFacade_remove(c);
  }, function (c) {
    return filterListAspect.addFilterFacade(c);
  }, function (c) {
    return filterListAspect.insertFilterFacade(c);
  });
  var choicesHover = ChoicesHover(function (down, hoveredChoice) {
    return filterListAspect.navigate(down, hoveredChoice);
  });
  var picks = Picks();
  var optionAspect = OptionAspect(dataSourceAspect);
  var optionToggleAspect = OptionToggleAspect(optionAspect);
  var choiceContentGenerator = def(configuration.choiceContentGenerator, defChoiceContentGenerator);
  var choicesElementAspect = ChoicesElementAspect(choicesDom, function (choiceElement, toggle) {
    return choiceContentGenerator(choiceElement, common, css, toggle);
  }, componentAspect, optionToggleAspect);
  var choiceFactoryAspect = ChoiceFactoryAspect(choicesElementAspect, choicesGetNextAspect);
  var choicesAspect = ChoicesAspect(window.document, optionAspect, dataSourceAspect, choices, choiceFactoryAspect);
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
    choicesGetNextAspect: choicesGetNextAspect,
    choicesEnumerableAspect: choicesEnumerableAspect,
    filterListAspect: filterListAspect,
    choices: choices,
    choicesHover: choicesHover,
    picks: picks,
    optionAspect: optionAspect,
    optionToggleAspect: optionToggleAspect,
    choicesElementAspect: choicesElementAspect,
    choiceFactoryAspect: choiceFactoryAspect,
    choicesAspect: choicesAspect,
    common: common
  }; // TODO: replace common with something new? 

  var pluginManager = PluginManager(plugins, pluginData);
  var pickContentGenerator = def(configuration.pickContentGenerator, defPickContentGenerator);
  var multiSelect = new MultiSelect(dataSourceAspect, componentAspect, picksDom, choicesDom, staticManager, popupAspect, function (pickElement) {
    return pickContentGenerator(pickElement, common, css);
  }, //choicesGetNextAspect,
  filterListAspect, choices, choicesHover, picks, optionAspect, optionToggleAspect, //choicesElementAspect, choiceFactoryAspect, 
  choicesAspect, window);
  pluginManager.afterConstructor(multiSelect);
  multiSelect.dispose = composeSync(pluginManager.dispose, multiSelect.dispose.bind(multiSelect), staticManager.dispose, popupAspect.dispose, picksDom.dispose);
  onInit == null ? void 0 : onInit(multiSelect);
  multiSelect.init();
  multiSelect.load();
  return multiSelect;
}

//# sourceMappingURL=BsMultiSelect.js.map