const transformStyles = [
    {old:'selectedPanelDisabledBackgroundColor', opt:'picks_disabled', style:"backgroundColor", samplVal:"'myValue'"},
    {old:'selectedPanelFocusValidBoxShadow', opt:'picks_focus_valid', style:"boxShadow", samplVal:"'myValue'"},
    {old:'selectedPanelFocusInvalidBoxShadow', opt:'picks_focus_invalid', style:"boxShadow", samplVal:"'myValue'"},
    {old:'selectedPanelDefMinHeight', opt:'picks_def', style:"minHeight", samplVal:"'myValue'"},
    {old:'selectedPanelLgMinHeight', opt:'picks_lg', style:"minHeight", samplVal:"'myValue'"},
    {old:'selectedPanelSmMinHeight', opt:'picks_sm', style:"minHeight", samplVal:"'myValue'"},
    {old:'selectedItemContentDisabledOpacity', opt:'choiceLabel_disabled', style:"opacity", samplVal:"'myValue'"}
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
        console.log("DashboarCode.BsMultiSelect: selectedPanelFocusBorderColor and selectedPanelFocusBoxShadow are depricated, use - cssPatch:{picks_focus:{borderColor:'myValue', boxShadow:'myValue'}}");
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
            console.log(`DashboarCode.BsMultiSelect: ${i.old} is depricated, use - css:{${i.opt}:${i.samplVal}}`);
            if(!css[i.opt]){
                css[i.opt]= configuration[i.old]
            }
            delete configuration[i.old];
        }
    })
    
    if (!configuration.css)
        configuration.css={}
    var css =configuration.css;

    if (configuration.useCss){
        console.log("DashboarCode.BsMultiSelect: useCss(=true) is depricated, use - 'useCssPatch: false'");
        if(!css.pick_disabled){
            configuration.useCssPatch = !configuration.useCss
        }
        delete configuration.useCss;
    }  
}