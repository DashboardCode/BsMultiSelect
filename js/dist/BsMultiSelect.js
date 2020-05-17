import { MultiSelect } from './MultiSelect';
import { PluginManager } from './PluginManager';
import { composeSync, def } from './ToolsJs';
import { pickContentGenerator as defPickContentGenerator } from './PickContentGenerator';
import { choiceContentGenerator as defChoiceContentGenerator } from './ChoiceContentGenerator';
import { StaticDomFactory } from './StaticDomFactory';
import { StaticPicks } from './StaticPicks';
import { StaticDialog } from './StaticDialog';
import { StaticContent } from './StaticContent';
import { ComponentAspect } from './ComponentAspect';
import { DataSourceAspect } from './DataSourceAspect';
import { selectElementStaticDomGenerator, selectElementCompletedDomGenerator } from './plugins/SelectElementPlugin';
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
  common.getDisabled = componentAspect.getDisabled; // --- --- --- --- ---         

  var staticContentGenerator = def(configuration.staticContentGenerator, StaticContent);

  var createElement = function createElement(name) {
    return window.document.createElement(name);
  };

  var pickContentGenerator = def(configuration.pickContentGenerator, defPickContentGenerator);
  var choiceContentGenerator = def(configuration.choiceContentGenerator, defChoiceContentGenerator);
  var staticDomFactory = StaticDomFactory(); // --- --- --- --- --- 

  var origStaticDomGenerator = staticDomFactory.staticDomGenerator;

  staticDomFactory.staticDomGenerator = function (e, c) {
    return selectElementStaticDomGenerator(origStaticDomGenerator, e, c);
  };

  var staticDom = staticDomFactory.staticDomGenerator(element, containerClass);

  var _appendToContainer = function appendToContainer(choicesElement) {
    return staticDom.containerElement.appendChild(choicesElement);
  };

  var ownContainerElement = staticDom.containerElement ? false : true;

  var _staticDomFactory$com = staticDomFactory.completedDomGenerator(staticDom, createElement),
      attachPicksElement = _staticDomFactory$com.attachPicksElement,
      detachPicksElement = _staticDomFactory$com.detachPicksElement;

  var selectElementContainerTools = selectElementCompletedDomGenerator(staticDom, containerClass, createElement);

  if (!ownContainerElement && staticDom.selectElement) {
    _appendToContainer = function appendToContainer(choicesElement) {
      return staticDom.selectElement.parentNode.insertBefore(choicesElement, staticDom.selectElement.nextSibling);
    };
  } // --- --- --- --- --- --- --- 


  var staticPicks = StaticPicks(staticDom.picksElement, createElement, css);

  if (detachPicksElement) {
    staticPicks.dispose = detachPicksElement;
  }

  var staticDialog = StaticDialog(createElement, css);
  var staticManager = {
    appendToContainer: function appendToContainer() {
      _appendToContainer(staticDialog.choicesElement); // add for SE && !ownContainerElement


      attachPicksElement == null ? void 0 : attachPicksElement();
    },
    dispose: function dispose() {
      staticDialog.choicesElement.parentNode.removeChild(staticDialog.choicesElement);
      staticPicks.dispose(); // already overrided for SE
    }
  };
  var staticContent = staticContentGenerator(staticDom, staticPicks, staticDialog, Popper);
  staticContent.selectElementContainerTools = selectElementContainerTools; // ---------------------------------------------------------------------------------------

  var pluginData = {
    window: window,
    containerClass: containerClass,
    configuration: configuration,
    staticDom: staticDom,
    staticContent: staticContent,
    staticPicks: staticPicks,
    staticDialog: staticDialog,
    staticManager: staticManager,
    trigger: trigger,
    common: common,
    dataSourceAspect: dataSourceAspect,
    componentAspect: componentAspect
  }; // TODO replace common with staticContent (but staticContent should be splitted)

  var pluginManager = PluginManager(plugins, pluginData);
  var multiSelect = new MultiSelect(dataSourceAspect, componentAspect, staticContent, staticManager, function (pickElement) {
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
} // export function StaticContentFactory(staticDom, staticPicks, staticDialog, Popper) { 
//     let staticDomFactory = StaticDomFactory();
//     // --- --- --- --- --- 
//     staticDomFactory.staticDomGenerator = (e,c) => selectElementStaticDomGenerator(staticDomFactory.staticDomGenerator, e, c);
//     let staticDom = staticDomFactory.staticDomGenerator( element, containerClass)
//     let appendToContainer = (choicesElement) => staticDom.containerElement.appendChild(choicesElement);
//     let ownContainerElement = staticDom.containerElement?false:true;
//     var {attachPicksElement, detachPicksElement} = staticDomFactory.completedDomGenerator(staticDom, createElement);
//     let selectElementContainerTools = selectElementCompletedDomGenerator(staticDom, containerClass, createElement);
//     if (!ownContainerElement && staticDom.selectElement){
//         appendToContainer = (choicesElement) => 
//             staticDom.selectElement.parentNode.insertBefore(choicesElement, staticDom.selectElement.nextSibling);
//     }
//     // --- --- --- --- --- --- --- 
//     var staticPicks = StaticPicks(staticDom.picksElement,  createElement, css);
//     if (detachPicksElement){
//         staticPicks.dispose = detachPicksElement;
//     }
//     var staticDialog = StaticDialog(createElement, css);
//     var staticManager = {
//         appendToContainer(){
//             appendToContainer(staticDialog.choicesElement);
//             // add for SE && !ownContainerElement
//             attachPicksElement?.();
//         },
//         dispose(){
//             staticDialog.choicesElement.parentNode.removeChild(staticDialog.choicesElement);
//             staticPicks.dispose(); // already overrided for SE
//         },
//     };
//     return {
//         staticDomFactory,
//         createStaticManager(){
//             let staticContent = staticContentGenerator(staticDom, staticPicks, staticDialog, Popper);
//             //staticContent.selectElementContainerTools = selectElementContainerTools;
//             return {
//                 staticContent,
//                 staticManager
//             }
//         }
//     }
// }

//# sourceMappingURL=BsMultiSelect.js.map