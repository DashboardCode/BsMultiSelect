import { PluginManager, staticDomDefaults } from './PluginManager';
import { composeSync, def } from './ToolsJs';
import { pickContentGenerator as defPickContentGenerator } from './PickContentGenerator';
import { choiceContentGenerator as defChoiceContentGenerator } from './ChoiceContentGenerator';
import { StaticDomFactory } from './StaticDomFactory';
import { PicksDom } from './PicksDom';
import { FilterDom } from './FilterDom';
import { ChoicesDom } from './ChoicesDom';
import { PopupAspect as DefaultPopupAspect } from './PopupAspect';
import { ComponentAspect } from './ComponentAspect';
import { DataSourceAspect } from './DataSourceAspect';
import { DoublyLinkedCollection } from './ToolsJs';
import { FilterListAspect, ChoicesGetNextAspect, ChoicesEnumerableAspect } from './FilterListAspect';
import { ChoicesElementAspect, ChoiceFactoryAspect, ChoicesAspect } from './ChoicesAspect';
import { UpdateDataAspect } from './UpdateDataAspect';
import { OptionToggleAspect, OptionAspect } from './OptionAspect.js';
import { Choices } from './Choices';
import { ChoicesHover } from './ChoicesHover';
import { Picks } from './Picks';
import { PicksAspect } from './PicksAspect';
import { InputAspect } from './InputAspect';
import { ResetFilterListAspect } from './ResetFilterListAspect';
import { ManageableResetFilterListAspect } from './ResetFilterListAspect';
import { FocusInAspect } from './ResetFilterListAspect';
import { MultiSelectInputAspect } from './MultiSelectInputAspect';
import { FilterAspect } from './FilterAspect';
import { DisabledComponentAspect, LoadAspect, AppearanceAspect } from './AppearanceAspect';
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
  var componentAspect = ComponentAspect(getDisabled, trigger);
  common.getDisabled = componentAspect.getDisabled;
  var dataSourceAspect = DataSourceAspect(options, getSelected, setSelected, getIsOptionDisabled);
  var optionAspect = OptionAspect(dataSourceAspect);
  var optionToggleAspect = OptionToggleAspect(optionAspect);
  var PopupAspect = def(configuration.staticContentGenerator, DefaultPopupAspect); // TODO: rename configuration.staticContentGenerator

  var createElement = function createElement(name) {
    return window.document.createElement(name);
  };

  var choicesDom = ChoicesDom(createElement, css);
  var staticDomFactory = StaticDomFactory(createElement, choicesDom.choicesElement);
  staticDomDefaults(plugins, staticDomFactory); // manipulates with staticDomFactory.staticDomGenerator

  var _staticDomFactory$sta = staticDomFactory.staticDomGenerator(element, containerClass),
      staticDom = _staticDomFactory$sta.staticDom,
      staticManager = _staticDomFactory$sta.staticManager;

  var filterDom = FilterDom(staticDom.disposablePicksElement, createElement, css); // TODO get picksDom  from staticDomFactory

  var picksDom = PicksDom(staticDom.picksElement, staticDom.disposablePicksElement, createElement, css);
  var focusInAspect = FocusInAspect(picksDom);
  var popupAspect = PopupAspect(choicesDom.choicesElement, filterDom.filterInputElement, Popper);
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
  var filterListAspect = FilterListAspect(choicesGetNextAspect, choicesEnumerableAspect);
  var resetFilterListAspect = ResetFilterListAspect(filterDom, filterListAspect);
  var manageableResetFilterListAspect = ManageableResetFilterListAspect(filterDom, resetFilterListAspect); // TODO move to fully index collection

  var choices = Choices(collection, function () {
    return filterListAspect.reset();
  }, function (c) {
    return filterListAspect.remove(c);
  }, function (c) {
    return filterListAspect.addFilterFacade(c);
  }, function (c) {
    return filterListAspect.insertFilterFacade(c);
  });
  var choicesHover = ChoicesHover(function (down, hoveredChoice) {
    return filterListAspect.navigate(down, hoveredChoice);
  });
  var inputAspect = InputAspect(filterListAspect, optionAspect, filterDom, popupAspect, choicesHover);
  var picks = Picks();
  var pickContentGenerator = def(configuration.pickContentGenerator, defPickContentGenerator);
  var picksAspect = PicksAspect(picksDom, function (pickElement) {
    return pickContentGenerator(pickElement, common, css);
  }, componentAspect, dataSourceAspect, optionAspect, picks, manageableResetFilterListAspect);
  var choiceContentGenerator = def(configuration.choiceContentGenerator, defChoiceContentGenerator);
  var choicesElementAspect = ChoicesElementAspect(choicesDom, filterDom, function (choiceElement, toggle) {
    return choiceContentGenerator(choiceElement, common, css, toggle);
  }, componentAspect, optionToggleAspect, picksAspect);
  var choiceFactoryAspect = ChoiceFactoryAspect(choicesElementAspect, choicesGetNextAspect);
  var choicesAspect = ChoicesAspect(window.document, optionAspect, dataSourceAspect, choices, choiceFactoryAspect);
  var multiSelectInputAspect = MultiSelectInputAspect(window, function () {
    return filterDom.setFocus();
  }, picksDom.picksElement, choicesDom.choicesElement, function () {
    return popupAspect.isChoicesVisible();
  }, function (visible) {
    return popupAspect.setChoicesVisible(visible);
  }, function () {
    return choicesHover.resetHoveredChoice();
  }, function (choice) {
    return choicesHover.hoverIn(choice);
  }, function () {
    return manageableResetFilterListAspect.resetFilter();
  }, function () {
    return filterListAspect.getCount() == 0;
  },
  /*onClick*/
  function (event) {
    return filterDom.setFocusIfNotTarget(event.target);
  },
  /*resetFocus*/
  function () {
    return focusInAspect.setFocusIn(false);
  },
  /*alignToFilterInputItemLocation*/
  function () {
    return popupAspect.updatePopupLocation();
  });
  var disabledComponentAspect = DisabledComponentAspect(componentAspect, picks, multiSelectInputAspect, picksDom);
  var appearanceAspect = AppearanceAspect(disabledComponentAspect);
  var loadAspect = LoadAspect(choicesAspect, multiSelectInputAspect, appearanceAspect);

  function hoveredToSelected() {
    var hoveredChoice = choicesHover.getHoveredChoice();

    if (hoveredChoice) {
      var wasToggled = optionToggleAspect.toggleOptionSelected(hoveredChoice);

      if (wasToggled) {
        multiSelectInputAspect.hideChoices();
        manageableResetFilterListAspect.resetFilter();
      }
    }
  }

  function keyDownArrow(down) {
    var choice = choicesHover.navigate(down);

    if (choice) {
      choicesHover.hoverIn(choice);
      multiSelectInputAspect.showChoices();
    }
  }

  var filterAspect = FilterAspect(filterDom.filterInputElement, function () {
    return focusInAspect.setFocusIn(true);
  }, // focus in - show dropdown
  function () {
    return multiSelectInputAspect.onFocusOut(function () {
      return focusInAspect.setFocusIn(false);
    });
  }, // focus out - hide dropdown
  function () {
    return keyDownArrow(false);
  }, // arrow up
  function () {
    return keyDownArrow(true);
  }, // arrow down

  /*onTabForEmpty*/
  function () {
    return multiSelectInputAspect.hideChoices();
  }, // tab on empty
  function () {
    var p = picks.removePicksTail();
    if (p) popupAspect.updatePopupLocation();
  }, // backspace - "remove last"

  /*onTabToCompleate*/
  function () {
    if (popupAspect.isChoicesVisible()) {
      hoveredToSelected();
    }
  },
  /*onEnterToCompleate*/
  function () {
    if (popupAspect.isChoicesVisible()) {
      hoveredToSelected();
    } else {
      if (filterListAspect.getCount() > 0) {
        multiSelectInputAspect.showChoices();
      }
    }
  },
  /*onKeyUpEsc*/
  function () {
    multiSelectInputAspect.hideChoices(); // always hide 1st

    manageableResetFilterListAspect.resetFilter();
  }, // esc keyup 
  // tab/enter "compleate hovered"

  /*stopEscKeyDownPropogation */
  function () {
    return popupAspect.isChoicesVisible();
  },
  /*onInput*/
  function (filterInputValue, resetLength) {
    inputAspect.input(filterInputValue, resetLength, function () {
      return multiSelectInputAspect.eventLoopFlag.set();
    }, function () {
      return multiSelectInputAspect.showChoices();
    }, function () {
      return multiSelectInputAspect.hideChoices();
    });
  });
  var updateDataAspect = UpdateDataAspect(multiSelectInputAspect, manageableResetFilterListAspect, choicesDom, choices, picks, choicesAspect);
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
    picksAspect: picksAspect,
    filterDom: filterDom,
    inputAspect: inputAspect,
    resetFilterListAspect: resetFilterListAspect,
    manageableResetFilterListAspect: manageableResetFilterListAspect,
    multiSelectInputAspect: multiSelectInputAspect,
    focusInAspect: focusInAspect,
    filterAspect: filterAspect,
    disabledComponentAspect: disabledComponentAspect,
    appearanceAspect: appearanceAspect,
    loadAspect: loadAspect,
    updateDataAspect: updateDataAspect,
    common: common // TODO: replace common with something new? 

  };
  var pluginManager = PluginManager(plugins, pluginData);
  var api = {
    component: "BsMultiSelect.api"
  };
  pluginManager.buildApi(api);
  api.dispose = composeSync(multiSelectInputAspect.hideChoices, pluginManager.dispose, picks.dispose, multiSelectInputAspect.dispose, choices.dispose, staticManager.dispose, popupAspect.dispose, picksDom.dispose, filterDom.dispose, filterAspect.dispose);
  api.updateData = updateDataAspect.updateData;

  api.update = function () {
    updateDataAspect.updateData();
    appearanceAspect.updateAppearance();
  };

  api.updateAppearance = appearanceAspect.updateAppearance;
  api.updateDisabled = disabledComponentAspect.updateDisabledComponent;
  onInit == null ? void 0 : onInit(api, pluginData);
  picksDom.pickFilterElement.appendChild(filterDom.filterInputElement);
  picksDom.picksElement.appendChild(picksDom.pickFilterElement);
  staticManager.appendToContainer();
  popupAspect.init();
  loadAspect.load();
  return api;
}

//# sourceMappingURL=BsMultiSelect.js.map