import {setStylingStyles,  setStylingСlasses} from './ToolsStyling';

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
            setStylingСlasses(stylings, "choices", cfgStylings);
        }
        if (cfgStylings.choice){
            setStylingСlasses(stylings, "choice", cfgStylings);
        }
        if (cfgStylings.choice_hover){
            setStylingСlasses(stylings, "choice_hover", cfgStylings);
        }
        if (cfgStylings.picks){
            setStylingСlasses(stylings, "picks", cfgStylings);
        }
        if (cfgStylings.pick){
            setStylingСlasses(stylings, "classes", cfgStylings);
        }
        if (cfgStylings.pickButton){
            setStylingСlasses(stylings, "pickButton", cfgStylings);
        }
        if (cfgStylings.pickFilter){
            setStylingСlasses(stylings, "pickFilter", cfgStylings);
        }
        if (cfgStylings.filterInput){
            setStylingСlasses(stylings, "filterInput", cfgStylings);
        }
        if (cfgStylings.picks_focus){
            setStylingСlasses(stylings, "picks_focus", cfgStylings);
        }
        if (cfgStylings.picks_disabled){
            setStylingСlasses(stylings, "picks_disabled", cfgStylings);
        }
        if (cfgStylings.pick_disabled){
            setStylingСlasses(stylings, "pick_disabled", cfgStylings);
        }
    }
}

export function injectConfigurationStyleValues(stylings, configuration){
    if (configuration.nocss_picks_disabled){
        setStylingStyles(stylings, "picks_disabled", configuration.nocss_picks_disabled);
    }
    if (configuration.nocss_picks_focus){
        setStylingStyles(stylings, "picks_focus", configuration.nocss_picks_focus);
    }
    if (configuration.nocss_picks_focus_valid){
        setStylingStyles(stylings, "picks_focus_valid", configuration.nocss_picks_focus_valid);
    }
    if (configuration.nocss_picks_focus_invalid){
        setStylingStyles(stylings, "picks_focus_invalid", configuration.nocss_picks_focus_invalid);
    }
    if (configuration.nocss_picks_def){
        setStylingStyles(stylings, "picks_def", configuration.nocss_picks_def);
    }
    if (configuration.nocss_picks_lg){
        setStylingStyles(stylings, "picks_lg", configuration.nocss_picks_lg);
    }
    if (configuration.nocss_picks_sm){
        setStylingStyles(stylings, "picks_sm", configuration.nocss_picks_sm);
    }
    if (configuration.nocss_choiceLabel_disabled){
        setStylingStyles(stylings, "choiceLabel_disabled", configuration.nocss_choiceLabel_disabled);
    }
}