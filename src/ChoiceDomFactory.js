import {EventBinder} from './ToolsDom';
import {addStyling, toggleStyling} from './ToolsStyling';

export function ChoiceDomFactory(css, createElementAspect,  optionPropertiesAspect){
    var updateDataInternal = function(wrap, element){
        element.textContent = optionPropertiesAspect.getText(wrap.option);
    }
    //TODO move check which aspects availbale like wrap.hasOwnProperty("isOptionSelected") to there
    return {
        create(choiceElement, wrap, toggle){
            let choiceDom = null;
            let choiceDomManagerHandlers = null;
            let eventBinder = EventBinder();
                eventBinder.bind(choiceElement, "click",  toggle);
            
            if (wrap.hasOwnProperty("isOptionSelected")){
                createElementAspect.createElementFromHtml(choiceElement, '<div><input formnovalidate type="checkbox"><label></label></div>');
                
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

function ChoiceDomFactoryPlugCss(css){
    css.choiceCheckBox_disabled = 'disabled'; //  not bs, in scss as 'ul.form-control li .custom-control-input.disabled ~ .custom-control-label'
    css.choiceLabel_disabled = '';
    css.choice_disabled_hover  = '';
    css.choice_hover = 'hover'; //  not bs, in scss as 'ul.dropdown-menu li.hover'
}

export function ChoiceDomFactoryPlugCssBs4(css){
    ChoiceDomFactoryPlugCss(css)
    css.choiceCheckBox = 'custom-control-input';
    css.choiceContent = 'custom-control custom-checkbox d-flex';
    css.choiceLabel = 'custom-control-label justify-content-start';
    css.choice_selected = '';
    css.choice_disabled = '';
}

export function ChoiceDomFactoryPlugCssBs5(css){
    ChoiceDomFactoryPlugCss(css)
    css.choiceCheckBox = 'form-check-input'; // bs
    css.choiceContent = 'form-check'; // bs d-flex required for rtl to align items
    css.choiceLabel = 'form-check-label';
    css.choice_selected = 'selected'; //  not bs,
    css.choice_disabled = 'disabled'; //  not bs,
}

export function ChoiceDomFactoryPlugCssPatch(cssPatch){
    cssPatch.choiceCheckBox = {color: 'inherit', cursor:'inherit'};
    cssPatch.choiceContent = {justifyContent: 'flex-start', cursor:'inherit'}; // BS problem: without this on inline form menu items justified center
    cssPatch.choiceLabel = {color: 'inherit', cursor:'inherit'}; // otherwise BS .was-validated set its color
    cssPatch.choiceLabel_disabled = {opacity: '.65'};  // more flexible than {color: '#6c757d'}; note: avoid opacity on pickElement's border; TODO write to BS4 
    cssPatch.choice_disabled_hover  = 'bg-light';
    cssPatch.choice_hover = 'text-primary bg-light';
}

