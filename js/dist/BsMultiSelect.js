import { PluginManager, plugStaticDom } from './PluginManager';
import { composeSync, List, extendIfUndefined } from './ToolsJs';
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
import { FilterManagerAspect, NavigateManager, FilterPredicateAspect } from './FilterManagerAspect';
import { BuildAndAttachChoiceAspect, BuildChoiceAspect } from './BuildChoiceAspect';
import { FillChoicesAspect } from './FillChoicesAspect';
import { UpdateDataAspect } from './UpdateDataAspect';
import { CreateWrapAspect, CreateChoiceBaseAspect, OptionToggleAspect, CreatePickHandlersAspect, RemovePickAspect, AddPickAspect, ChoiceClickAspect, IsChoiceSelectableAspect, SetOptionSelectedAspect } from './CreateWrapAspect.js';
import { NavigateAspect, HoveredChoiceAspect } from './NavigateAspect';
import { Wraps } from './Wraps';
import { BuildPickAspect } from './BuildPickAspect';
import { InputAspect } from './InputAspect';
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
      getText = configuration.getText;
  var disposeAspect = {};
  var triggerAspect = TriggerAspect(element, environment.trigger);
  var onChangeAspect = OnChangeAspect(triggerAspect, 'dashboardcode.multiselect:change');
  var componentPropertiesAspect = ComponentPropertiesAspect(getDisabled != null ? getDisabled : function () {
    return false;
  });
  var optionsAspect = OptionsAspect(options);
  var optionPropertiesAspect = OptionPropertiesAspect(getText);
  var isChoiceSelectableAspect = IsChoiceSelectableAspect();
  var createWrapAspect = CreateWrapAspect();
  var createChoiceBaseAspect = CreateChoiceBaseAspect(optionPropertiesAspect); //let setOptionSelectedAspect = SetOptionSelectedAspect(optionPropertiesAspect);

  var addPickAspect = AddPickAspect();
  var removePickAspect = RemovePickAspect();
  var createElementAspect = CreateElementAspect(function (name) {
    return window.document.createElement(name);
  });
  var choicesDomFactory = ChoicesDomFactory(createElementAspect);
  var staticDomFactory = StaticDomFactory(choicesDomFactory, createElementAspect);
  var wrapsCollection = ArrayFacade();
  var countableChoicesList = DoublyLinkedList(function (wrap) {
    return wrap.choice.itemPrev;
  }, function (warp, v) {
    return warp.choice.itemPrev = v;
  }, function (wrap) {
    return wrap.choice.itemNext;
  }, function (wrap, v) {
    return wrap.choice.itemNext = v;
  });
  var countableChoicesListInsertAspect = CountableChoicesListInsertAspect(countableChoicesList, wrapsCollection);
  var choicesEnumerableAspect = ChoicesEnumerableAspect(countableChoicesList, function (wrap) {
    return wrap.choice.itemNext;
  });
  var filteredChoicesList = DoublyLinkedList(function (wrap) {
    return wrap.choice.filteredPrev;
  }, function (wrap, v) {
    return wrap.choice.filteredPrev = v;
  }, function (wrap) {
    return wrap.choice.filteredNext;
  }, function (wrap, v) {
    return wrap.choice.filteredNext = v;
  });
  var emptyNavigateManager = NavigateManager(countableChoicesList, function (wrap) {
    return wrap.choice.itemPrev;
  }, function (wrap) {
    return wrap.choice.itemNext;
  });
  var filteredNavigateManager = NavigateManager(filteredChoicesList, function (wrap) {
    return wrap.choice.filteredPrev;
  }, function (wrap) {
    return wrap.choice.filteredNext;
  });
  var filterPredicateAspect = FilterPredicateAspect();
  var filterManagerAspect = FilterManagerAspect(emptyNavigateManager, filteredNavigateManager, filteredChoicesList, choicesEnumerableAspect, filterPredicateAspect);
  var hoveredChoiceAspect = HoveredChoiceAspect();
  var navigateAspect = NavigateAspect(hoveredChoiceAspect, function (down, hoveredChoice) {
    return filterManagerAspect.getNavigateManager().navigate(down, hoveredChoice);
  });
  var picksList = List();
  var wraps = Wraps(wrapsCollection, function () {
    return countableChoicesList.reset();
  }, function (w) {
    return countableChoicesList.remove(w);
  }, function (w, key) {
    return countableChoicesListInsertAspect.countableChoicesListInsert(w, key);
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
    createWrapAspect: createWrapAspect,
    createChoiceBaseAspect: createChoiceBaseAspect,
    isChoiceSelectableAspect: isChoiceSelectableAspect,
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
    picksList: picksList,
    wraps: wraps,
    addPickAspect: addPickAspect,
    removePickAspect: removePickAspect
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
  var inputAspect = InputAspect(filterDom, filterManagerAspect); // TODO get picksDom  from staticDomFactory

  var picksDom = PicksDom(staticDom.picksElement, staticDom.disposablePicksElement, createElementAspect, css);
  var focusInAspect = FocusInAspect(picksDom);
  var pickDomFactory = PickDomFactory(css, componentPropertiesAspect, optionPropertiesAspect);
  var buildPickAspect = BuildPickAspect(picksDom, pickDomFactory);
  var createPickHandlersAspect = CreatePickHandlersAspect(picksList, removePickAspect, buildPickAspect);
  var choiceDomFactory = ChoiceDomFactory(css, optionPropertiesAspect);
  var optionToggleAspect = OptionToggleAspect(createPickHandlersAspect, addPickAspect);
  var choiceClickAspect = ChoiceClickAspect(optionToggleAspect, filterDom);
  var buildChoiceAspect = BuildChoiceAspect(choicesDom, choiceDomFactory, choiceClickAspect);
  var buildAndAttachChoiceAspect = BuildAndAttachChoiceAspect(buildChoiceAspect);
  var resetLayoutAspect = ResetLayoutAspect(function () {
    return resetFilterAspect.resetFilter();
  });
  var setDisabledComponentAspect = SetDisabledComponentAspect(picksList, picksDom);
  var updateDisabledComponentAspect = UpdateDisabledComponentAspect(componentPropertiesAspect, setDisabledComponentAspect);
  var appearanceAspect = AppearanceAspect(updateDisabledComponentAspect);
  var fillChoicesAspect = FillChoicesAspect(window.document, createWrapAspect, createChoiceBaseAspect, optionsAspect, wraps, buildAndAttachChoiceAspect);
  var loadAspect = LoadAspect(fillChoicesAspect, appearanceAspect);
  var updateDataAspect = UpdateDataAspect(choicesDom, wraps, picksList, fillChoicesAspect, resetLayoutAspect);
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
    optionToggleAspect: optionToggleAspect,
    choiceClickAspect: choiceClickAspect,
    buildAndAttachChoiceAspect: buildAndAttachChoiceAspect,
    fillChoicesAspect: fillChoicesAspect,
    buildPickAspect: buildPickAspect,
    createPickHandlersAspect: createPickHandlersAspect,
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

  api.dispose = composeSync(resetLayoutAspect.resetLayout, disposeAspect.dispose, pluginManager.dispose, function () {
    picksList.forEach(function (wrap) {
      return wrap.pick.dispose();
    });
  }, multiSelectInlineLayout.dispose, // TODO move to layout
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