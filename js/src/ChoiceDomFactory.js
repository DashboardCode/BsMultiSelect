import {EventBinder} from './ToolsDom';
import {addStyling, toggleStyling} from './ToolsStyling';

export function ChoiceDomFactory(css, optionPropertiesAspect, highlightAspect){
    
    var updateHighlightedInternal = function(wrap, choiceDom,  element) {
        var text = optionPropertiesAspect.getText(wrap.option);
        var highlighter = highlightAspect.getHighlighter();
        if (highlighter)
            highlighter(element, choiceDom, text);                    
        else
            element.textContent = text;
    }
    var updateDataInternal = function(wrap, element){
        element.textContent = optionPropertiesAspect.getText(wrap.option);;
    }
    //TODO move check which aspects availbale like wrap.hasOwnProperty("isOptionSelected") to there
    return {
        create(choiceElement, wrap, toggle){
            let choiceDom = null;
            let choiceDomManagerHandlers = null;
            let eventBinder = EventBinder();
                eventBinder.bind(choiceElement, "click",  toggle);
            
            if (wrap.hasOwnProperty("isOptionSelected")){
                choiceElement.innerHTML = '<div><input formnovalidate type="checkbox"><label></label></div>';
                
                let choiceContentElement = choiceElement.querySelector('DIV');
                let choiceCheckBoxElement = choiceContentElement.querySelector('INPUT');
                let choiceLabelElement = choiceContentElement.querySelector('LABEL');
                
                addStyling(choiceContentElement,  css.choiceContent); 
                addStyling(choiceCheckBoxElement, css.choiceCheckBox); 
                addStyling(choiceLabelElement,    css.choiceLabel); 

                choiceDom = {
                    choiceElement,
                    choiceContentElement,
                    choiceCheckBoxElement,
                    choiceLabelElement
                };
                
                let choiceSelectedToggle = toggleStyling(choiceElement, css.choice_selected);
                let updateSelected = function(){ 
                    choiceSelectedToggle(wrap.isOptionSelected);
                    choiceCheckBoxElement.checked = wrap.isOptionSelected;
                    if (wrap.isOptionDisabled || wrap.choice.isHoverIn){
                        choiceHoverToggle(wrap.choice.isHoverIn, true);
                    }
                }

                let choiceDisabledToggle = toggleStyling(choiceElement, css.choice_disabled);
                let choiceCheckBoxDisabledToggle = toggleStyling(choiceCheckBoxElement, css.choiceCheckBox_disabled);
                let choiceLabelDisabledToggle = toggleStyling(choiceLabelElement, css.choiceLabel_disabled);
                let choiceCursorDisabledToggle = toggleStyling(choiceElement, {classes:[], styles:{cursor:"default"}}); 
                let updateDisabled = function(){
                    choiceDisabledToggle(wrap.isOptionDisabled);
                    choiceCheckBoxDisabledToggle(wrap.isOptionDisabled);
                    choiceLabelDisabledToggle(wrap.isOptionDisabled);
    
                    // do not desable checkBox if option is selected! there should be possibility to unselect "disabled"
                    let isCheckBoxDisabled = wrap.isOptionDisabled && !wrap.isOptionSelected;
                    choiceCheckBoxElement.disabled = isCheckBoxDisabled;
                    choiceCursorDisabledToggle(isCheckBoxDisabled);
                }

                let choiceHoverToggle    = toggleStyling(choiceElement, ()=>{
                    if (css.choice_disabled_hover &&  wrap.isOptionDisabled===true && wrap.isOptionSelected===false)
                        return css.choice_disabled_hover;
                    else
                        return css.choice_hover;
                });
                let updateHoverIn = function(){
                    choiceHoverToggle(wrap.choice.isHoverIn);
                }

                choiceDomManagerHandlers = {
                    updateData: ()=>updateDataInternal(wrap, choiceLabelElement),
                    updateHighlighted: ()=>updateHighlightedInternal(wrap, choiceDom, choiceLabelElement), 
                    updateHoverIn,
                    updateDisabled,
                    updateSelected, 
                }

                
            }else{
                let choiceHoverToggle    = toggleStyling(choiceElement, ()=>
                    (wrap.isOptionDisabled && css.choice_disabled_hover)?css.choice_disabled_hover:css.choice_hover);
                
                let updateHoverIn = function(){
                    choiceHoverToggle(wrap.choice.isHoverIn);
                }
                choiceElement.innerHTML = '<span></span>';
                let choiceContentElement = choiceElement.querySelector('SPAN');
                choiceDom = {
                    
                    choiceElement,
                    choiceContentElement,
                };
                choiceDomManagerHandlers = {
                    updateData: ()=>updateDataInternal(wrap, choiceContentElement),
                    updateHighlighted: ()=>updateHighlightedInternal(wrap, choiceDom, choiceElement), 
                    updateHoverIn
                }
            }
            
            return {
                choiceDom,
                choiceDomManagerHandlers, 
                dispose(){
                    eventBinder.unbind();
                }
            }
        }
    }
}


