import {EventBinder} from './ToolsDom';
import {addStyling, toggleStyling} from './ToolsStyling';
import {composeSync} from './ToolsJs';

export function ChoiceDomFactory(css, createElementAspect,  optionPropertiesAspect){
    var updateDataInternal = function(wrap, element){
        element.textContent = optionPropertiesAspect.getText(wrap.option);
    }
    //TODO move check which aspects availbale like wrap.hasOwnProperty("isOptionSelected") to there
    return {
        create(choice){
            let wrap = choice.wrap;
            let choiceElement = choice.choiceDom.choiceElement;
            let choiceDom = choice.choiceDom;
            let choiceDomManagerHandlers = choice.choiceDomManagerHandlers;

            let choiceHoverToggle = null;
            
            if (wrap.hasOwnProperty("isOptionSelected")){
                
                choiceHoverToggle = toggleStyling(choiceElement, () =>
                    (wrap.isOptionDisabled===true && css.choice_disabled_hover && wrap.isOptionSelected===false)?
                        css.choice_disabled_hover:css.choice_hover
                );

                createElementAspect.createElementFromHtml(choiceElement, '<div><input formnovalidate type="checkbox"><label></label></div>');
                let choiceContentElement = choiceElement.querySelector('DIV');
                let choiceCheckBoxElement = choiceContentElement.querySelector('INPUT');
                let choiceLabelElement = choiceContentElement.querySelector('LABEL');
                
                addStyling(choiceContentElement,  css.choiceContent); 
                addStyling(choiceCheckBoxElement, css.choiceCheckBox); 
                addStyling(choiceLabelElement,    css.choiceLabel); 

                choiceDom.choiceContentElement = choiceContentElement;
                choiceDom.choiceCheckBoxElement = choiceCheckBoxElement;
                choiceDom.choiceLabelElement = choiceLabelElement;
                
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

                choiceDomManagerHandlers.updateData = ()=>updateDataInternal(wrap, choiceLabelElement);
                choiceDomManagerHandlers.updateHoverIn = updateHoverIn;
                choiceDomManagerHandlers.updateSelected = updateSelected;
                choiceDomManagerHandlers.updateDisabled = updateDisabled;
                composeSync(choice.dispose, ()=>{  
                    choiceDomManagerHandlers.updateData = null;
                    choiceDomManagerHandlers.updateHoverIn = null;
                    choiceDomManagerHandlers.updateSelected = null;
                    choiceDomManagerHandlers.updateDisabled = null;
                    choiceDom.choiceContentElement = null;
                    choiceDom.choiceCheckBoxElement = null;
                    choiceDom.choiceLabelElement = null;
                });

            }else{
                choiceHoverToggle    = toggleStyling(choiceElement, ()=>
                    (wrap.isOptionDisabled && css.choice_disabled_hover)?
                        css.choice_disabled_hover:css.choice_hover
                );
                
                choiceElement.innerHTML = '<div></div>';
                let choiceContentElement = choiceElement.querySelector('div');

                choiceDom.choiceContentElement = choiceContentElement;
                
                choiceDomManagerHandlers.updateData = ()=>updateDataInternal(wrap, choiceContentElement);
                composeSync(choice.dispose, ()=>{  
                        choiceDomManagerHandlers.updateData = null;
                        choiceDom.choiceContentElement = null;
                });
            }

            choiceDomManagerHandlers.updateData();

            let updateHoverIn = function(){
                choiceHoverToggle(wrap.choice.isHoverIn);
            }
            choiceDomManagerHandlers.updateHoverIn=updateHoverIn;

            let eventBinder = EventBinder();
            eventBinder.bind(choiceElement, "click", event=>choice.choiсeClick(event) );

            composeSync(choice.dispose, ()=>{  eventBinder.unbind(); });

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

