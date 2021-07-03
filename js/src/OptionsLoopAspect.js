export function OptionAttachAspect(createWrapAspect, createChoiceBaseAspect, buildAndAttachChoiceAspect, wraps){
    return {
        attach(option){
            let wrap = createWrapAspect.createWrap(option);

            // let optGroup = optGroupAspect.getOptionOptGroup(option);
            // if (prevOptGroup != optGroup){
            //     currentOptGroup = optGroup;
            //     var optGroupWrap = optGroupBuildAspect.wrapAndAttachOptGroupItem(option);
            // }
            // wrap.optGroup = currentOptGroup;
            
            wrap.choice = createChoiceBaseAspect.createChoiceBase(option);
            wraps.push(wrap); // TODO move to the end
            buildAndAttachChoiceAspect.buildAndAttachChoice(wrap);
            //wraps.push(wrap);
        }
    }
}

export function OptionsLoopAspect(optionsAspect, optionAttachAspect){ 
    return{
        loop(){
            let options = optionsAspect.getOptions();
            for(let i = 0; i<options.length; i++) {
                let option = options[i];
                optionAttachAspect.attach(option);
            } 
        }
    }
}