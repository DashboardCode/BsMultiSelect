import { PluginManager, plugStaticDom } from './PluginManager';
import { composeSync, extendIfUndefined } from './ToolsJs';
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
import { FilterManagerAspect, NavigateManager, FilterPredicateAspect } from './FilterListAspect';
import { BuildAndAttachChoiceAspect, BuildChoiceAspect } from './BuildChoiceAspect';
import { FillChoicesAspect } from './FillChoicesAspect';
import { UpdateDataAspect } from './UpdateDataAspect';
import { OptionToggleAspect } from './OptionToggleAspect';
import { CreateChoiceAspect, IsChoiceSelectableAspect, SetOptionSelectedAspect } from './CreateChoiceAspect.js';
import { NavigateAspect, HoveredChoiceAspect } from './NavigateAspect';
import { Wraps } from './Wraps';
import { Picks } from './Picks';
import { BuildPickAspect } from './BuildPickAspect';
import { InputAspect, SetSelectedIfExactMatch } from './InputAspect';
import { ResetFilterAspect, FocusInAspect, ResetFilterListAspect } from './ResetFilterListAspect';
import { MultiSelectInlineLayout } from './MultiSelectInlineLayout';
import { SetDisabledComponentAspect, UpdateDisabledComponentAspect, LoadAspect, AppearanceAspect, ResetLayoutAspect } from './AppearanceAspect';
import { DoublyLinkedList, ArrayFacade } from './ToolsJs';
import { CountableChoicesListInsertAspect } from './CountableChoicesListInsertAspect'; /// environment - common for many; configuration for concreate

export function BsMultiSelect(element, environment, configuration, onInit) {
  var _extendIfUndefined;

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
      setSelected = configuration.setSelected;
  var disposeAspect = {};
  var triggerAspect = TriggerAspect(element, environment.trigger);
  var onChangeAspect = OnChangeAspect(triggerAspect, 'dashboardcode.multiselect:change');
  var componentPropertiesAspect = ComponentPropertiesAspect(getDisabled != null ? getDisabled : function () {
    return false;
  });
  var optionsAspect = OptionsAspect(options);
  var optionPropertiesAspect = OptionPropertiesAspect(getText, getSelected, setSelected);
  var isChoiceSelectableAspect = IsChoiceSelectableAspect();
  var createChoiceAspect = CreateChoiceAspect(optionPropertiesAspect);
  var setOptionSelectedAspect = SetOptionSelectedAspect(optionPropertiesAspect);
  var optionToggleAspect = OptionToggleAspect(setOptionSelectedAspect);
  var createElementAspect = CreateElementAspect(function (name) {
    return window.document.createElement(name);
  });
  var choicesDomFactory = ChoicesDomFactory(createElementAspect);
  var staticDomFactory = StaticDomFactory(choicesDomFactory, createElementAspect);
  var wrapsCollection = ArrayFacade();
  var countableChoicesList = DoublyLinkedList(function (choice) {
    return choice.itemPrev;
  }, function (choice, v) {
    return choice.itemPrev = v;
  }, function (choice) {
    return choice.itemNext;
  }, function (choice, v) {
    return choice.itemNext = v;
  });
  var countableChoicesListInsertAspect = CountableChoicesListInsertAspect(countableChoicesList, wrapsCollection);
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
  var filterPredicateAspect = FilterPredicateAspect();
  var filterManagerAspect = FilterManagerAspect(emptyNavigateManager, filteredNavigateManager, filteredChoicesList, choicesEnumerableAspect, filterPredicateAspect);
  var hoveredChoiceAspect = HoveredChoiceAspect();
  var navigateAspect = NavigateAspect(hoveredChoiceAspect, function (down, hoveredChoice) {
    return filterManagerAspect.getNavigateManager().navigate(down, hoveredChoice);
  });
  var picks = Picks();
  var wraps = Wraps(wrapsCollection, function () {
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
    filterPredicateAspect: filterPredicateAspect,
    wrapsCollection: wrapsCollection,
    choicesEnumerableAspect: choicesEnumerableAspect,
    filteredChoicesList: filteredChoicesList,
    filterManagerAspect: filterManagerAspect,
    hoveredChoiceAspect: hoveredChoiceAspect,
    navigateAspect: navigateAspect,
    picks: picks,
    wraps: wraps
  };
  plugStaticDom(plugins, aspects); // apply cssPatch to css, apply selectElement support;  

  var _staticDomFactory$cre = staticDomFactory.create(css),
      choicesDom = _staticDomFactory$cre.choicesDom,
      createStaticDom = _staticDomFactory$cre.createStaticDom;

  var _createStaticDom = createStaticDom(element, containerClass),
      staticDom = _createStaticDom.staticDom,
      staticManager = _createStaticDom.staticManager; // after this we can use staticDom in construtctor, this simplifies parameters passing a lot   


  var filterDom = FilterDom(staticDom.disposablePicksElement, createElementAspect, css);
  var popupAspect = PopupAspect(choicesDom.choicesElement, filterDom.filterInputElement, Popper);
  var resetFilterListAspect = ResetFilterListAspect(filterDom, filterManagerAspect);
  var resetFilterAspect = ResetFilterAspect(filterDom, resetFilterListAspect);
  var setSelectedIfExactMatch = SetSelectedIfExactMatch(filterDom, filterManagerAspect);
  var inputAspect = InputAspect(filterDom, filterManagerAspect, setSelectedIfExactMatch); // TODO get picksDom  from staticDomFactory

  var picksDom = PicksDom(staticDom.picksElement, staticDom.disposablePicksElement, createElementAspect, css);
  var focusInAspect = FocusInAspect(picksDom);
  var pickDomFactory = PickDomFactory(css, componentPropertiesAspect, optionPropertiesAspect);
  var buildPickAspect = BuildPickAspect(picksDom, pickDomFactory, setOptionSelectedAspect);
  var choiceDomFactory = ChoiceDomFactory(css, optionPropertiesAspect);
  var buildChoiceAspect = BuildChoiceAspect(choicesDom, choiceDomFactory, optionToggleAspect, filterDom, onChangeAspect);
  var buildAndAttachChoiceAspect = BuildAndAttachChoiceAspect(buildChoiceAspect);
  var resetLayoutAspect = ResetLayoutAspect(function () {
    return resetFilterAspect.resetFilter();
  });
  var setDisabledComponentAspect = SetDisabledComponentAspect(picks, picksDom);
  var updateDisabledComponentAspect = UpdateDisabledComponentAspect(componentPropertiesAspect, setDisabledComponentAspect);
  var appearanceAspect = AppearanceAspect(updateDisabledComponentAspect);
  var fillChoicesAspect = FillChoicesAspect(window.document, createChoiceAspect, optionsAspect, wraps, buildAndAttachChoiceAspect);
  var loadAspect = LoadAspect(fillChoicesAspect, appearanceAspect);
  var updateDataAspect = UpdateDataAspect(choicesDom, wraps, picks, fillChoicesAspect, resetLayoutAspect);
  extendIfUndefined(aspects, (_extendIfUndefined = {
    staticDom: staticDom,
    picksDom: picksDom,
    choicesDom: choicesDom,
    filterDom: filterDom,
    resetLayoutAspect: resetLayoutAspect,
    pickDomFactory: pickDomFactory,
    choiceDomFactory: choiceDomFactory,
    popupAspect: popupAspect,
    staticManager: staticManager,
    buildChoiceAspect: buildChoiceAspect,
    buildAndAttachChoiceAspect: buildAndAttachChoiceAspect,
    fillChoicesAspect: fillChoicesAspect,
    buildPickAspect: buildPickAspect,
    setSelectedIfExactMatch: setSelectedIfExactMatch,
    inputAspect: inputAspect,
    resetFilterListAspect: resetFilterListAspect,
    resetFilterAspect: resetFilterAspect
  }, _extendIfUndefined["resetLayoutAspect"] = resetLayoutAspect, _extendIfUndefined.focusInAspect = focusInAspect, _extendIfUndefined.updateDisabledComponentAspect = updateDisabledComponentAspect, _extendIfUndefined.setDisabledComponentAspect = setDisabledComponentAspect, _extendIfUndefined.appearanceAspect = appearanceAspect, _extendIfUndefined.loadAspect = loadAspect, _extendIfUndefined.updateDataAspect = updateDataAspect, _extendIfUndefined));
  var pluginManager = PluginManager(plugins, aspects);
  var multiSelectInlineLayout = MultiSelectInlineLayout(aspects);
  var api = {
    component: "BsMultiSelect.api"
  }; // key used in memory leak analyzes

  pluginManager.buildApi(api); // after this we can pass aspects methods call without wrapping - there should be no more overridings. TODO freeze aspects?

  api.dispose = composeSync(resetLayoutAspect.resetLayout, disposeAspect.dispose, pluginManager.dispose, picks.dispose, multiSelectInlineLayout.dispose, // TODO move to layout
  wraps.dispose, staticManager.dispose, popupAspect.dispose, picksDom.dispose, filterDom.dispose);
  api.updateAppearance = appearanceAspect.updateAppearance;
  api.updateData = updateDataAspect.updateData;

  api.update = function () {
    updateDataAspect.updateData();
    appearanceAspect.updateAppearance();
  };

  api.updateDisabled = updateDisabledComponentAspect.updateDisabledComponent; // TODO api.updateOption = (key) => {/* all updates: selected, disabled, hidden, text */}

  onInit == null ? void 0 : onInit(api, aspects);
  picksDom.pickFilterElement.appendChild(filterDom.filterInputElement);
  picksDom.picksElement.appendChild(picksDom.pickFilterElement);
  staticManager.appendToContainer();
  popupAspect.init();
  loadAspect.load();
  return api;
}

//# sourceMappingURL=BsMultiSelect.js.map