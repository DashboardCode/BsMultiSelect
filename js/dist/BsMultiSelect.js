import { PluginManager, plugStaticDom } from './PluginManager';
import { composeSync } from './ToolsJs';
import { PickDomFactory } from './PickDomFactory';
import { ChoiceDomFactory } from './ChoiceDomFactory';
import { StaticDomFactory, CreateElementAspect } from './StaticDomFactory';
import { PicksDom } from './PicksDom';
import { FilterDom } from './FilterDom';
import { ChoicesDomFactory } from './ChoicesDomFactory';
import { PopupAspect } from './PopupAspect';
import { ComponentPropertiesAspect, TriggerAspect, OnChangeAspect } from './ComponentPropertiesAspect';
import { OptionsAspect, OptionPropertiesAspect } from './OptionsAspect';
import { ChoicesEnumerableAspect } from './ChoicesEnumerableAspect';
import { FilterManagerAspect, NavigateManager } from './FilterListAspect';
import { BuildAndAttachChoiceAspect, BuildChoiceAspect } from './BuildChoiceAspect';
import { FillChoicesAspect } from './FillChoicesAspect';
import { UpdateDataAspect } from './UpdateDataAspect';
import { OptionToggleAspect } from './OptionToggleAspect';
import { CreateChoiceAspect, IsChoiceSelectableAspect, SetOptionSelectedAspect } from './CreateChoiceAspect.js';
import { Choices } from './Choices';
import { NavigateAspect, HoveredChoiceAspect } from './NavigateAspect';
import { Picks } from './Picks';
import { BuildPickAspect } from './BuildPickAspect';
import { InputAspect } from './InputAspect';
import { ResetFilterListAspect } from './ResetFilterListAspect';
import { ManageableResetFilterListAspect } from './ResetFilterListAspect';
import { FocusInAspect } from './ResetFilterListAspect';
import { MultiSelectInlineLayoutAspect } from './MultiSelectInlineLayoutAspect';
import { FilterAspect } from './FilterAspect';
import { DisabledComponentAspect, LoadAspect, AppearanceAspect } from './AppearanceAspect';
import { DoublyLinkedList, ArrayFacade } from './ToolsJs';
import { CountableChoicesListInsertAspect } from './CountableChoicesListInsertAspect'; /// environment - common for many; configuration for concreate

export function BsMultiSelect(element, environment, configuration, onInit) {
  var Popper = environment.Popper,
      window = environment.window,
      plugins = environment.plugins;

  if (typeof Popper === 'undefined') {
    throw new Error("BsMultiSelect: Popper.js (https://popper.js.org) is required");
  }

  var containerClass = configuration.containerClass,
      css = configuration.css,
      getDisabled = configuration.getDisabled,
      options = configuration.options,
      getText = configuration.getText,
      getSelected = configuration.getSelected,
      setSelected = configuration.setSelected,
      getIsOptionDisabled = configuration.getIsOptionDisabled;
  var disposeAspect = {};
  var triggerAspect = TriggerAspect(element, environment.trigger);
  var onChangeAspect = OnChangeAspect(triggerAspect, 'dashboardcode.multiselect:change');
  var componentPropertiesAspect = ComponentPropertiesAspect(getDisabled != null ? getDisabled : function () {
    return false;
  });
  var optionsAspect = OptionsAspect(options);
  var optionPropertiesAspect = OptionPropertiesAspect(getText, getSelected, setSelected, getIsOptionDisabled);
  var isChoiceSelectableAspect = IsChoiceSelectableAspect();
  var createChoiceAspect = CreateChoiceAspect(optionPropertiesAspect);
  var setOptionSelectedAspect = SetOptionSelectedAspect(optionPropertiesAspect);
  var optionToggleAspect = OptionToggleAspect(setOptionSelectedAspect);
  var createElementAspect = CreateElementAspect(function (name) {
    return window.document.createElement(name);
  });
  var choicesDomFactory = ChoicesDomFactory(createElementAspect);
  var staticDomFactory = StaticDomFactory(choicesDomFactory, createElementAspect);
  var choicesCollection = ArrayFacade();
  var countableChoicesList = DoublyLinkedList(function (choice) {
    return choice.itemPrev;
  }, function (choice, v) {
    return choice.itemPrev = v;
  }, function (choice) {
    return choice.itemNext;
  }, function (choice, v) {
    return choice.itemNext = v;
  });
  var countableChoicesListInsertAspect = CountableChoicesListInsertAspect(countableChoicesList);
  var choicesEnumerableAspect = ChoicesEnumerableAspect(countableChoicesList, function (choice) {
    return choice.itemNext;
  });
  var filteredChoicesList = DoublyLinkedList(function (choice) {
    return choice.filteredPrev;
  }, function (choice, v) {
    return choice.filteredPrev = v;
  }, function (choice) {
    return choice.filteredNext;
  }, function (choice, v) {
    return choice.filteredNext = v;
  });
  var emptyNavigateManager = NavigateManager(countableChoicesList, function (choice) {
    return choice.itemPrev;
  }, function (choice) {
    return choice.itemNext;
  });
  var filteredNavigateManager = NavigateManager(filteredChoicesList, function (choice) {
    return choice.filteredPrev;
  }, function (choice) {
    return choice.filteredNext;
  });
  var filterManagerAspect = FilterManagerAspect(emptyNavigateManager, filteredNavigateManager, filteredChoicesList, choicesEnumerableAspect);
  var hoveredChoiceAspect = HoveredChoiceAspect();
  var navigateAspect = NavigateAspect(hoveredChoiceAspect, function (down, hoveredChoice) {
    return filterManagerAspect.getNavigateManager().navigate(down, hoveredChoice);
  });
  var picks = Picks();
  var choices = Choices(choicesCollection, function () {
    return countableChoicesList.reset();
  }, function (c) {
    return countableChoicesList.remove(c);
  }, function (c, key) {
    return countableChoicesListInsertAspect.countableChoicesListInsert(c, key);
  });
  var aspects = {
    environment: environment,
    configuration: configuration,
    triggerAspect: triggerAspect,
    onChangeAspect: onChangeAspect,
    componentPropertiesAspect: componentPropertiesAspect,
    disposeAspect: disposeAspect,
    countableChoicesList: countableChoicesList,
    countableChoicesListInsertAspect: countableChoicesListInsertAspect,
    optionsAspect: optionsAspect,
    optionPropertiesAspect: optionPropertiesAspect,
    createChoiceAspect: createChoiceAspect,
    setOptionSelectedAspect: setOptionSelectedAspect,
    isChoiceSelectableAspect: isChoiceSelectableAspect,
    optionToggleAspect: optionToggleAspect,
    createElementAspect: createElementAspect,
    choicesDomFactory: choicesDomFactory,
    staticDomFactory: staticDomFactory,
    choicesCollection: choicesCollection,
    choicesEnumerableAspect: choicesEnumerableAspect,
    filteredChoicesList: filteredChoicesList,
    filterManagerAspect: filterManagerAspect,
    hoveredChoiceAspect: hoveredChoiceAspect,
    navigateAspect: navigateAspect,
    picks: picks,
    choices: choices
  };
  plugStaticDom(plugins, aspects); // apply cssPatch to css, apply selectElement support;  

  var _staticDomFactory$cre = staticDomFactory.create(css),
      choicesDom = _staticDomFactory$cre.choicesDom,
      createStaticDom = _staticDomFactory$cre.createStaticDom;

  var _createStaticDom = createStaticDom(element, containerClass),
      staticDom = _createStaticDom.staticDom,
      staticManager = _createStaticDom.staticManager; // after this we can use staticDom in construtctor, this simplifies parameter passing a lot   


  var filterDom = FilterDom(staticDom.disposablePicksElement, createElementAspect, css);
  var popupAspect = PopupAspect(choicesDom.choicesElement, filterDom.filterInputElement, Popper);
  var resetFilterListAspect = ResetFilterListAspect(filterDom, filterManagerAspect);
  var manageableResetFilterListAspect = ManageableResetFilterListAspect(filterDom, resetFilterListAspect);
  var inputAspect = InputAspect(filterDom, filterManagerAspect,
  /* setSelectedIfExactMatch */
  function (text) {
    var wasSetEmpty = false;

    if (filterManagerAspect.getNavigateManager().getCount() == 1) {
      var fullMatchChoice = filterManagerAspect.getNavigateManager().getHead();

      if (fullMatchChoice.searchText == text) {
        setOptionSelectedAspect.setOptionSelected(fullMatchChoice, true);
        filterDom.setEmpty();
        wasSetEmpty = true;
      }
    }

    return wasSetEmpty;
  }); // TODO get picksDom  from staticDomFactory

  var picksDom = PicksDom(staticDom.picksElement, staticDom.disposablePicksElement, createElementAspect, css);
  var focusInAspect = FocusInAspect(picksDom); // -----------
  // TODO not real aspect, correct it
  // actually this should be a builder of all events (wrapper or redesign)

  var multiSelectInlineLayoutAspect = MultiSelectInlineLayoutAspect(window, function () {
    return filterDom.setFocus();
  }, picksDom.picksElement, choicesDom.choicesElement, function () {
    return popupAspect.isChoicesVisible();
  }, function (visible) {
    return popupAspect.setChoicesVisible(visible);
  }, function () {
    return hoveredChoiceAspect.resetHoveredChoice();
  }, function (choice) {
    return navigateAspect.hoverIn(choice);
  }, function (down) {
    return navigateAspect.navigate(down);
  }, function () {
    return manageableResetFilterListAspect.resetFilter();
  },
  /*getNavigateManager*/
  function () {
    return filterManagerAspect.getNavigateManager();
  },
  /*onClick*/
  function (event) {
    return filterDom.setFocusIfNotTarget(event.target);
  },
  /*resetFocus*/
  function () {
    return focusInAspect.setFocusIn(false);
  },
  /*setFocus*/
  function () {
    return focusInAspect.setFocusIn(true);
  },
  /*alignToFilterInputItemLocation*/
  function () {
    return popupAspect.updatePopupLocation();
  },
  /*toggleHovered*/
  function () {
    var wasToggled = false;
    var hoveredChoice = hoveredChoiceAspect.getHoveredChoice();

    if (hoveredChoice) {
      wasToggled = optionToggleAspect.toggle(hoveredChoice);
    }

    return wasToggled;
  }, // --------------------------------------------------------
  filterDom,
  /*onInput*/
  function () {
    return inputAspect.processInput();
  }); // TODO: bind it declarative way

  FilterAspect(filterDom, function () {
    return multiSelectInlineLayoutAspect.keyDownArrow(false);
  }, // arrow up
  function () {
    return multiSelectInlineLayoutAspect.keyDownArrow(true);
  }, // arrow down

  /*onTabForEmpty*/
  function () {
    return multiSelectInlineLayoutAspect.hideChoices();
  }, // tab on empty
  function () {
    var p = picks.removePicksTail();
    if (p) popupAspect.updatePopupLocation();
  }, // backspace - "remove last"

  /*onTabToCompleate*/
  function () {
    if (popupAspect.isChoicesVisible()) {
      multiSelectInlineLayoutAspect.hoveredToSelected();
    }
  },
  /*onEnterToCompleate*/
  function () {
    if (popupAspect.isChoicesVisible()) {
      multiSelectInlineLayoutAspect.hoveredToSelected();
    } else {
      if (filterManagerAspect.getNavigateManager().getCount() > 0) {
        multiSelectInlineLayoutAspect.showChoices();
      }
    }
  },
  /*onKeyUpEsc*/
  function () {
    multiSelectInlineLayoutAspect.hideChoices(); // always hide 1st

    manageableResetFilterListAspect.resetFilter();
  }, // esc keyup 
  // tab/enter "compleate hovered"

  /*stopEscKeyDownPropogation*/
  function () {
    return popupAspect.isChoicesVisible();
  });
  var pickDomFactory = PickDomFactory(css, componentPropertiesAspect, optionPropertiesAspect);
  var createPickAspect = BuildPickAspect(setOptionSelectedAspect, picks, picksDom, pickDomFactory);
  var choiceDomFactory = ChoiceDomFactory(css, optionPropertiesAspect);
  var buildChoiceAspect = BuildChoiceAspect(choicesDom, filterDom, choiceDomFactory, onChangeAspect, optionToggleAspect, createPickAspect, function (c, e) {
    return multiSelectInlineLayoutAspect.adoptChoiceElement(c, e);
  }, function (s) {
    return multiSelectInlineLayoutAspect.handleOnRemoveButton(s);
  });
  var buildAndAttachChoiceAspect = BuildAndAttachChoiceAspect(buildChoiceAspect);
  var disabledComponentAspect = DisabledComponentAspect(componentPropertiesAspect, picks, picksDom, function (newIsComponentDisabled) {
    return multiSelectInlineLayoutAspect.disableComponent(newIsComponentDisabled);
  });
  var appearanceAspect = AppearanceAspect(disabledComponentAspect);
  var fillChoicesAspect = FillChoicesAspect(window.document, createChoiceAspect, optionsAspect, choices, function (choice) {
    return buildAndAttachChoiceAspect.buildAndAttachChoice(choice);
  });
  var loadAspect = LoadAspect(fillChoicesAspect, appearanceAspect);
  var updateDataAspect = UpdateDataAspect(choicesDom, choices, picks, fillChoicesAspect,
  /*before*/
  function () {
    multiSelectInlineLayoutAspect.hideChoices(); // always hide 1st

    manageableResetFilterListAspect.resetFilter();
  });
  aspects.pickDomFactory = pickDomFactory;
  aspects.choiceDomFactory = choiceDomFactory;
  aspects.staticDom = staticDom;
  aspects.picksDom = picksDom;
  aspects.choicesDom = choicesDom;
  aspects.popupAspect = popupAspect;
  aspects.staticManager = staticManager;
  aspects.buildChoiceAspect = buildChoiceAspect;
  aspects.buildAndAttachChoiceAspect = buildAndAttachChoiceAspect;
  aspects.fillChoicesAspect = fillChoicesAspect;
  aspects.createPickAspect = createPickAspect;
  aspects.filterDom = filterDom;
  aspects.inputAspect = inputAspect;
  aspects.resetFilterListAspect = resetFilterListAspect;
  aspects.manageableResetFilterListAspect = manageableResetFilterListAspect;
  aspects.multiSelectInlineLayoutAspect = multiSelectInlineLayoutAspect;
  aspects.focusInAspect = focusInAspect;
  aspects.disabledComponentAspect = disabledComponentAspect;
  aspects.appearanceAspect = appearanceAspect;
  aspects.loadAspect = loadAspect;
  aspects.updateDataAspect = updateDataAspect;
  var pluginManager = PluginManager(plugins, aspects);
  var api = {
    component: "BsMultiSelect.api"
  }; // key used in memory leak analyzes

  pluginManager.buildApi(api);
  api.dispose = composeSync(multiSelectInlineLayoutAspect.hideChoices, disposeAspect.dispose, pluginManager.dispose, picks.dispose, multiSelectInlineLayoutAspect.dispose, choices.dispose, staticManager.dispose, popupAspect.dispose, picksDom.dispose, filterDom.dispose);
  api.updateData = updateDataAspect.updateData;

  api.update = function () {
    updateDataAspect.updateData();
    appearanceAspect.updateAppearance();
  };

  api.updateAppearance = appearanceAspect.updateAppearance;
  api.updateDisabled = disabledComponentAspect.updateDisabledComponent;
  onInit == null ? void 0 : onInit(api, aspects);
  picksDom.pickFilterElement.appendChild(filterDom.filterInputElement);
  picksDom.picksElement.appendChild(picksDom.pickFilterElement);
  staticManager.appendToContainer();
  popupAspect.init();
  loadAspect.load();
  return api;
}

//# sourceMappingURL=BsMultiSelect.js.map