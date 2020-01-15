import {setStylingStyle,  setStylingСlass} from './ToolsStyling';

const transformStyles = [
    {old:'selectedPanelDisabledBackgroundColor', opt:'nocss_picks_disabled', style:"backgroundColor", samplVal:"'myValue'"},
    {old:'selectedPanelFocusValidBoxShadow', opt:'nocss_picks_focus_valid', style:"boxShadow", samplVal:"'myValue'"},
    {old:'selectedPanelFocusInvalidBoxShadow', opt:'nocss_picks_focus_invalid', style:"boxShadow", samplVal:"'myValue'"},
    {old:'selectedPanelDefMinHeight', opt:'nocss_picks_def', style:"minHeight", samplVal:"'myValue'"},
    {old:'selectedPanelLgMinHeight', opt:'nocss_picks_lg', style:"minHeight", samplVal:"'myValue'"},
    {old:'selectedPanelSmMinHeight', opt:'nocss_picks_sm', style:"minHeight", samplVal:"'myValue'"},
    {old:'selectedItemContentDisabledOpacity', opt:'nocss_choiceLabel_disabled', style:"opacity", samplVal:"'myValue'"}
]

const transformClasses = [
    {old:'dropDownMenuClass', opt:'choices', samplVal:"'myValue'"},
    {old:'dropDownItemClass', opt:'choice', samplVal:"'myValue'"},
    {old:'dropDownItemHoverClass', opt:'choice_hover', samplVal:"'myValue'"},
    {old:'selectedPanelClass', opt:'picks', samplVal:"'myValue'"},
    {old:'selectedItemClass', opt:'pick', samplVal:"'myValue'"},
    {old:'removeSelectedItemButtonClass', opt:'pickButton', samplVal:"'myValue'"},
    {old:'filterInputItemClass', opt:'pickFilter', samplVal:"'myValue'"},
    {old:'filterInputClass', opt:'filterInput', samplVal:"'myValue'"},
    {old:'selectedPanelFocusClass', opt:'picks_focus', samplVal:"'myValue'"},
    {old:'selectedPanelDisabledClass', opt:'picks_disabled', samplVal:"'myValue'"},
    {old:'selectedItemContentDisabledClass', opt:'pick_disabled', samplVal:"'myValue'"}
]

export function adjustLegacyConfiguration(configuration){
    if (configuration.selectedPanelFocusBorderColor || configuration.selectedPanelFocusBoxShadow){
        console.log("DashboarCode.BsMultiSelect: selectedPanelFocusBorderColor and selectedPanelFocusBoxShadow are depricated, use - nocss_picks_focus:{borderColor:'myValue', boxShadow:'myValue'}");
        if(!configuration.nocss_picks_focus){
            configuration.nocss_picks_focus = {boxShadow: configuration.selectedPanelFocusBoxShadow, borderColor: configuration.selectedPanelFocusBorderColor}
        }
        delete configuration.selectedPanelFocusBorderColor;
        delete configuration.selectedPanelFocusBoxShadow;
    }

    transformStyles.forEach(
        (i)=>{
            if (configuration[i.old]){
                console.log(`DashboarCode.BsMultiSelect: ${i.old} is depricated, use - ${i.opt}:{${i.style}:'${i.samplVal}'}`);
                if(!configuration[i.opt]){
                    let opt = {}
                    opt[i.style] = configuration[i.old]
                    configuration[i.opt]=opt.xx;
                }
                delete configuration[i.old];
            }
        }
    )
    
    if (configuration.inputColor){
        console.log("DashboarCode.BsMultiSelect: inputColor is depricated, remove parameter");
        delete configuration.inputColor;
    }
    
    transformClasses.forEach( (i) => {
        if (configuration[i.old]){
            console.log(`DashboarCode.BsMultiSelect: ${i.old} is depricated, use - stylings:{${i.opt}:${i.samplVal}}`);
            if(!stylings[i.opt]){
                stylings[i.opt]= configuration[i.old]
            }
            delete configuration[i.old];
        }
    })
    
    if (!configuration.stylings)
        configuration.stylings={}
    var stylings =configuration.stylings;

    if (configuration.useCss){
        console.log("DashboarCode.BsMultiSelect: useCss is depricated, use - 'useOwnCss: false|true'");
        if(!stylings.pick_disabled){
            configuration.useOwnCss= configuration.useCss
        }
        delete configuration.useCss;
    }  
}
export function replaceConfigurationClassValues(stylings, configuration){
    var cfgStylings = configuration.stylings;
    if (cfgStylings)
    {
        if (cfgStylings.choices){
            setStylingСlass(stylings.choices.classes, cfgStylings.choices);
        }
        if (cfgStylings.choice){
            setStylingСlass(stylings.choice.classes, cfgStylings.choice);
        }
        if (cfgStylings.choice_hover){
            setStylingСlass(stylings.choice_hover.classes, cfgStylings.choice_hover);
        }
        if (cfgStylings.picks){
            setStylingСlass(stylings.picks.classes, cfgStylings.picks);
        }
        if (cfgStylings.pick){
            setStylingСlass(stylings.pick.classes, cfgStylings.pick);
        }
        if (cfgStylings.pickButton){
            setStylingСlass(stylings.pickButton.classes, cfgStylings.pickButton);
        }
        if (cfgStylings.pickFilter){
            setStylingСlass(stylings.pickFilter.classes, cfgStylings.pickFilter);
        }
        if (cfgStylings.filterInput){
            setStylingСlass(stylings.filterInput.classes, cfgStylings.filterInput);
        }
        if (cfgStylings.picks_focus){
            setStylingСlass(stylings.picks_focus.classes, cfgStylings.picks_focus);
        }
        if (cfgStylings.picks_disabled){
            setStylingСlass(stylings.picks_disabled.classes, cfgStylings.picks_disabled);
        }
        if (cfgStylings.pick_disabled){
            setStylingСlass(stylings.pick_disabled.classes, cfgStylings.pick_disabled);
        }
    }
}

export function injectConfigurationStyleValues(stylings, configuration){
    if (configuration.nocss_picks_disabled){
        setStylingStyle(stylings, "picks_disabled", configuration.nocss_picks_disabled);
    }
    if (configuration.nocss_picks_focus){
        setStylingStyle(stylings, "picks_focus", configuration.nocss_picks_focus);
    }
    if (configuration.nocss_picks_focus_valid){
        setStylingStyle(stylings, "picks_focus_valid", configuration.nocss_picks_focus_valid);
    }
    if (configuration.nocss_picks_focus_invalid){
        setStylingStyle(stylings, "picks_focus_invalid", configuration.nocss_picks_focus_invalid);
    }
    if (configuration.nocss_picks_def){
        setStylingStyle(stylings, "picks_def", configuration.nocss_picks_def);
    }
    if (configuration.nocss_picks_lg){
        setStylingStyle(stylings, "picks_lg", configuration.nocss_picks_lg);
    }
    if (configuration.nocss_picks_sm){
        setStylingStyle(stylings, "picks_sm", configuration.nocss_picks_sm);
    }
    if (configuration.nocss_choiceLabel_disabled){
        setStylingStyle(stylings, "choiceLabel_disabled", configuration.nocss_choiceLabel_disabled);
    }
}