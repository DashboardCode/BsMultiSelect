import {composeSync} from '../ToolsJs';

export function PicksPlugin(){
    return {
        plug
    }
}

export function plug(configuration){
    return (aspects) => {
        return {
            plugStaticDom: ()=> {
                let {picksList} = aspects;
                let {picks} = configuration;
                if (picks) {
                    let {add: origAdd, reset: origReset} = picksList;
                
                    picksList.add = (e) => {
                        let {remove, index} = origAdd(e);
                        picks.push(e);
                        return { remove: composeSync(remove, () => void picks.splice(index(), 1)), index};
                    }
                
                    picksList.reset = () => {
                        origReset();
                        picks.length = 0;
                    }
                }
            },
            layout: () => {
                let {inputAspect, filterDom, filterManagerAspect} = aspects;
                let {picks, addOptionPicked} = configuration;
                /*
                if (!addOptionPicked){
                    addOptionPicked = (option, index, value) => {
                        if (value)
                            picks.push(option);
                        else
                            picks.splice(index, 1);
                        return true;
                    };
                }
            
                function trySetWrapSelected(option, updateSelected, booleanValue){
                    let success = false;
                    var confirmed = setIsOptionSelected(option, booleanValue);
                    if (!(confirmed===false)) {
                        updateSelected();
                        success = true;
                    }
                    return success;
                }
            
                let origProcessInput = inputAspect.processInput;
                inputAspect.processInput = () => {
                    let origResult = origProcessInput();
                    if (!origResult.isEmpty)
                    {
                        if ( filterManagerAspect.getNavigateManager().getCount() == 1)
                        {
                            // todo: move exact match to filterManager
                            let fullMatchWrap =  filterManagerAspect.getNavigateManager().getHead();
                            let text = filterManagerAspect.getFilter();
                            if (fullMatchWrap.choice.searchText == text)
                            {
                                let success = trySetWrapSelected(fullMatchWrap, true);
                                if (success) {
                                    filterDom.setEmpty();
                                    origResult.isEmpty = true;
                                }
                            }
                        }
                    }
                    return origResult;
                }*/
            }
        }
    }
}