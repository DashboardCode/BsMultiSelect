import {composeSync} from './ToolsJs';

export function PicksAspect(picksDom, pickContentGenerator, 
     componentAspect, dataSourceAspect, optionAspect, picks){
    return {
        createPick(choice, handleOnRemoveButton /* this.aspect.handleOnRemoveButton */){
            let { pickElement, attach, detach } = picksDom.createPickElement(); 
            let pickContent = pickContentGenerator(pickElement);
            
            var pick = {
                disableRemove: () => pickContent.disableRemove(componentAspect.getDisabled()),
                setData: () => pickContent.setData(choice.option),
                disable: () => pickContent.disable(dataSourceAspect.getDisabled(choice.option) ),
                remove: null,
                dispose: () => { 
                    detach(); 
                    pickContent.dispose(); 
                    pick.disableRemove=null; pick.setData=null; pick.disable=null; pick.remove=null; 
                    pick.dispose=null;  
                }, 
            }
            pick.setData();
            pick.disableRemove();
            
            attach();
            let choiceUpdateDisabledBackup = choice.updateDisabled;
            choice.updateDisabled = composeSync(choiceUpdateDisabledBackup, pick.disable);
    
            var removeFromList = picks.addPick(pick);
            let removePick = () => {
                removeFromList();
                pick.dispose();
    
                choice.updateDisabled = choiceUpdateDisabledBackup; 
                choice.updateDisabled(); // make "true disabled" without it checkbox looks disabled
            }
            let setSelectedFalse = () => optionAspect.setOptionSelected(choice, false)
            pick.remove = setSelectedFalse;
        
            handleOnRemoveButton(pickContent.onRemove, setSelectedFalse);
            return removePick;
        }
    }
}