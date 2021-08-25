import { addStyling } from "../ToolsStyling";

const defNoResultsWarningMessage = 'No results found';

export function WarningPlugin(pluginData){

    let {configuration, choicesDom, createElementAspect, staticManager} = pluginData;
    let {css} = configuration;
    if (configuration.isNoResultsWarningEnabled)
        pluginData.warningAspect = WarningAspect(choicesDom, createElementAspect, staticManager, css)
}

WarningPlugin.plugDefaultConfig = (defaults)=>{
    defaults.noResultsWarning = defNoResultsWarningMessage;
    defaults.isNoResultsWarningEnabled = false;
}

function WarningAspect(choicesDom, createElementAspect, staticManager, css){
    let choicesElement = choicesDom.choicesElement;

    var warningElement = createElementAspect.createElement('DIV'); 
    
    var origAppendToContainer = staticManager.appendToContainer;
    staticManager.appendToContainer = function(){
        origAppendToContainer();
        choicesElement.parentNode.insertBefore(warningElement, choicesElement.nextSibling); // insert after
    }
    
    warningElement.style.display = 'none';
    addStyling(warningElement, css.warning);

    return {
        warningElement,
        show(message){
            warningElement.style.display = 'block';
            warningElement.innerHTML = message;
        },
        hide(){
            warningElement.style.display = 'none';
            warningElement.innerHTML = "";
        }
    }
}