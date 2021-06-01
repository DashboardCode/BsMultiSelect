import {composeSync} from '../ToolsJs';
import {toggleStyling} from '../ToolsStyling';

export function FloatingLabelPlugin(pluginData){
    let {configuration, picksList, picksDom, filterDom, staticDom, updateDataAspect,
         resetFilterListAspect, floatingLabelAspect} = pluginData;
    let {css, getDefaultLabel} = configuration;
    
    let initialElement = staticDom.initialElement;
    if (floatingLabelAspect.isFloatingLabel() ){
        
        let labelElement =  getDefaultLabel(initialElement);
        let picksElement = picksDom.picksElement;

        var liftToggleStyling1 = toggleStyling(labelElement, css.label_floating_lifted);
        var liftToggleStyling2 = toggleStyling(picksElement, css.picks_floating_lifted);

        function liftedLabel(isEmpty){
            liftToggleStyling1(isEmpty);
            liftToggleStyling2(isEmpty);
        }

        let isEmpty = () => picksList.isEmpty() && filterDom.isEmpty() && !picksDom.getIsFocusIn();;

        function updateLiftedLabel(){
            liftedLabel(!isEmpty());
        };

        updateLiftedLabel();

        resetFilterListAspect.forceResetFilter = composeSync(resetFilterListAspect.forceResetFilter, updateLiftedLabel);
            
        let origAdd = picksList.add;
        picksList.add = (pick) => { 
            let returnValue = origAdd(pick);
            if (picksList.getCount()==1) 
                updateLiftedLabel()
            pick.dispose = composeSync(pick.dispose, ()=>
                { 
                    if (picksList.getCount()==0) 
                        updateLiftedLabel()
                })
            return returnValue;
        };
    
        var origToggleFocusStyling = picksDom.toggleFocusStyling;
        picksDom.toggleFocusStyling = () => {
            var isFocusIn = picksDom.getIsFocusIn();
            origToggleFocusStyling(isFocusIn);
            updateLiftedLabel();
        }

        updateDataAspect.updateData = composeSync(updateDataAspect.updateData, updateLiftedLabel);
    }
}

FloatingLabelPlugin.plugStaticDom = (aspects) => {
    aspects.floatingLabelAspect = FloatingLabelAspect();
}

function FloatingLabelAspect() {
    return {
        isFloatingLabel(){},
    }
}