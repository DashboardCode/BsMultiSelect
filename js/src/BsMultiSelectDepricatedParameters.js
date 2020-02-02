const transformStyles = [
    {old:'selectedPanelDisabledBackgroundColor', opt:'picks_disabled', style:"backgroundColor"},
    {old:'selectedPanelFocusValidBoxShadow', opt:'picks_focus_valid', style:"boxShadow"},
    {old:'selectedPanelFocusInvalidBoxShadow', opt:'picks_focus_invalid', style:"boxShadow"},
    {old:'selectedPanelDefMinHeight', opt:'picks_def', style:"minHeight"},
    {old:'selectedPanelLgMinHeight', opt:'picks_lg', style:"minHeight"},
    {old:'selectedPanelSmMinHeight', opt:'picks_sm', style:"minHeight"},
    {old:'selectedItemContentDisabledOpacity', opt:'choiceLabel_disabled', style:"opacity"}
]

const transformClasses = [
    {old:'dropDownMenuClass', opt:'choices'},
    {old:'dropDownItemClass', opt:'choice'},
    {old:'dropDownItemHoverClass', opt:'choice_hover'},
    {old:'selectedPanelClass', opt:'picks'},
    {old:'selectedItemClass', opt:'pick'},
    {old:'removeSelectedItemButtonClass', opt:'pickButton'},
    {old:'filterInputItemClass', opt:'pickFilter'},
    {old:'filterInputClass', opt:'filterInput'},
    {old:'selectedPanelFocusClass', opt:'picks_focus'},
    {old:'selectedPanelDisabledClass', opt:'picks_disabled'},
    {old:'selectedItemContentDisabledClass', opt:'pick_disabled'}
]

export function adjustLegacyConfiguration(configuration){
    if (!configuration.css)
        configuration.css={}
    var css =configuration.css;

    if (!configuration.cssPatch)
        configuration.cssPatch={}
    var cssPatch =configuration.cssPatch;

    if (configuration.selectedPanelFocusBorderColor || configuration.selectedPanelFocusBoxShadow){
        console.log("DashboarCode.BsMultiSelect: selectedPanelFocusBorderColor and selectedPanelFocusBoxShadow are depricated, use - cssPatch:{picks_focus:{borderColor:'myValue', boxShadow:'myValue'}}");
        if(!cssPatch.picks_focus){
            cssPatch.picks_focus = {boxShadow: configuration.selectedPanelFocusBoxShadow, borderColor: configuration.selectedPanelFocusBorderColor}
        }
        delete configuration.selectedPanelFocusBorderColor;
        delete configuration.selectedPanelFocusBoxShadow;
    }

    transformStyles.forEach(
        (i)=>{
            if (configuration[i.old]){
                console.log(`DashboarCode.BsMultiSelect: ${i.old} is depricated, use - cssPatch:{${i.opt}:{${i.style}:'myValue'}}`);
                if(!configuration[i.opt]){
                    let opt = {}
                    opt[i.style] = configuration[i.old]
                    configuration.cssPatch[i.opt]=opt;
                }
                delete configuration[i.old];
            }
        }
    )
    
    transformClasses.forEach( (i) => {
        if (configuration[i.old]){
            console.log(`DashboarCode.BsMultiSelect: ${i.old} is depricated, use - css:{${i.opt}:'myValue'}`);
            if(!css[i.opt]){
                css[i.opt]= configuration[i.old]
            }
            delete configuration[i.old];
        }
    })
    
    if (configuration.inputColor){
        console.log("DashboarCode.BsMultiSelect: inputColor is depricated, remove parameter");
        delete configuration.inputColor;
    }

    if (configuration.useCss){
        console.log("DashboarCode.BsMultiSelect: useCss(=true) is depricated, use - 'useCssPatch: false'");
        if(!css.pick_disabled){
            configuration.useCssPatch = !configuration.useCss
        }
        delete configuration.useCss;
    }  

    if (configuration.getIsValid || configuration.getIsInValid){
        throw "DashboarCode.BsMultiSelect: parameters getIsValid and getIsInValid are depricated and removed, use - getValidity that should return (true|false|null) "
    } 
}