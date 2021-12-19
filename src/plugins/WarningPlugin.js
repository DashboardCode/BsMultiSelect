import {addStyling} from "../ToolsStyling";
import {composeSync} from '../ToolsJs';

const defNoResultsWarningMessage = 'No results found';

export function preset(o){o.noResultsWarning=defNoResultsWarningMessage; o.isNoResultsWarningEnabled=false;}

export function plug(configuration){
    return (aspects) => {
        return {
            layout: () => {
                let {choicesDom, staticManager, afterInputAspect, filterManagerAspect, resetLayoutAspect, staticDom} = aspects;
                let {createElementAspect} = staticDom;
                let {css, noResultsWarning} = configuration;

                if (configuration.isNoResultsWarningEnabled){
                    let warningAspect = WarningAspect(choicesDom, createElementAspect, staticManager, css);
                    aspects.warningAspect = warningAspect;
                
                    ExtendAfterInputAspect(afterInputAspect, warningAspect, filterManagerAspect, noResultsWarning);
                
                    resetLayoutAspect.resetLayout = composeSync(() => warningAspect.hide(), resetLayoutAspect.resetLayout);
                }
            },
            append: ()=> {
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
    staticManager.appendToContainer = composeSync(staticManager.appendToContainer, ()=>
        choicesElement.parentNode.insertBefore(warningElement, choicesElement.nextSibling));

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