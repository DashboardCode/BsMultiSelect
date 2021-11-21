import {addStyling} from "../ToolsStyling";
import {composeSync} from '../ToolsJs';

const defNoResultsWarningMessage = 'No results found';

export function WarningPlugin(defaults){
    defaults.noResultsWarning = defNoResultsWarningMessage;
    defaults.isNoResultsWarningEnabled = false;
    return {
        plug
    }
}

export function plug(configuration){
    return (aspects) => {
        return {
            layout: () => {
                let {choicesDom, createElementAspect, staticManager, afterInputAspect, filterManagerAspect, resetLayoutAspect} = aspects;
                let {css, noResultsWarning} = configuration;

                if (configuration.isNoResultsWarningEnabled){
                    let warningAspect = WarningAspect(choicesDom, createElementAspect, staticManager, css);
                    aspects.warningAspect = warningAspect;
                
                    ExtendAfterInputAspect(afterInputAspect, warningAspect, filterManagerAspect, noResultsWarning);
                
                    resetLayoutAspect.resetLayout = composeSync(() => warningAspect.hide(), resetLayoutAspect.resetLayout);
                }
            },
            attach: ()=> {
                let {createPopperAspect, filterDom, warningAspect, staticManager, disposeAspect} = aspects;
                if (warningAspect){
                    let filterInputElement = filterDom.filterInputElement;

                    let pop2 = createPopperAspect.createPopper(warningAspect.warningElement, filterInputElement, false);
                    staticManager.appendToContainer = composeSync(staticManager.appendToContainer, pop2.init);

                    var origWarningAspectShow = warningAspect.show;
                    warningAspect.show = (msg) => {
                        pop2.update();
                        origWarningAspectShow(msg);
                    }
                    disposeAspect.dispose = composeSync(disposeAspect.dispose, pop2.dispose);      
                }
            }
        }
    }
}

function ExtendAfterInputAspect(afterInputAspect, warningAspect, filterManagerAspect, noResultsWarning){
    var origVisible = afterInputAspect.visible;
    afterInputAspect.visible = (showChoices, visibleCount) => {
        warningAspect.hide(); 
        origVisible(showChoices, visibleCount)
    }

    var origNotVisible = afterInputAspect.notVisible;
    afterInputAspect.notVisible = (hideChoices) => {
        origNotVisible(hideChoices);
    
        if (filterManagerAspect.getFilter())
            warningAspect.show(noResultsWarning); 
        else
            warningAspect.hide();
    }
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