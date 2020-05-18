import { MultiSelect } from './MultiSelect';
import { PluginManager, staticDomDefaults } from './PluginManager';
import { composeSync, def } from './ToolsJs';
import { pickContentGenerator as defPickContentGenerator } from './PickContentGenerator';
import { choiceContentGenerator as defChoiceContentGenerator } from './ChoiceContentGenerator';
import { StaticDomFactory } from './StaticDomFactory';
import { StaticPicks } from './StaticPicks';
import { StaticDialog } from './StaticDialog';
import { StaticContent } from './StaticContent';
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
  var staticContentGenerator = def(configuration.staticContentGenerator, StaticContent);

  var createElement = function createElement(name) {
    return window.document.createElement(name);
  };

  var staticDomFactory = StaticDomFactory(createElement);
  staticDomDefaults(plugins, staticDomFactory);
  var staticDom = staticDomFactory.staticDomGenerator(element, containerClass); // TODO get staticPicks and staticDialog from staticDomFactory

  var staticPicks = StaticPicks(staticDom.picksElement, createElement, css);
  var staticDialog = StaticDialog(createElement, css);
  var staticManager = {
    appendToContainer: function appendToContainer() {
      staticDom.appendChoicesToContainer(staticDialog.choicesElement); // add for SE && !ownContainerElement

      staticDom.attachPicksElement == null ? void 0 : staticDom.attachPicksElement();
    },
    dispose: function dispose() {
      staticDialog.choicesElement.parentNode.removeChild(staticDialog.choicesElement);
      if (staticDom.detachPicksElement) staticDom.detachPicksElement(); // some kind of optimization with abstraction leak
      else staticPicks.dispose(); // already overrided for SE
    }
  };
  var staticContent = staticContentGenerator(staticPicks.filterInputElement, staticDialog.choicesElement, Popper);
  var pluginData = {
    environment: environment,
    configuration: configuration,
    dataSourceAspect: dataSourceAspect,
    componentAspect: componentAspect,
    staticDom: staticDom,
    staticPicks: staticPicks,
    staticDialog: staticDialog,
    staticContent: staticContent,
    staticManager: staticManager,
    common: common
  }; // TODO replace common with staticContent (but staticContent should be splitted)

  var pluginManager = PluginManager(plugins, pluginData);
  var pickContentGenerator = def(configuration.pickContentGenerator, defPickContentGenerator);
  var choiceContentGenerator = def(configuration.choiceContentGenerator, defChoiceContentGenerator);
  var multiSelect = new MultiSelect(dataSourceAspect, componentAspect, staticContent, staticPicks, staticDialog, staticManager, function (pickElement) {
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