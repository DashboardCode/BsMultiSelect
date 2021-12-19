export function OptionAttachAspect(createWrapAspect, createChoiceBaseAspect, buildAndAttachChoiceAspect, wraps){
    return {
        attach(option){
            let wrap = createWrapAspect.createWrap(option);
            wrap.choice = createChoiceBaseAspect.createChoiceBase(option);
            
            
            wraps.push(wrap); // note: before attach because attach need it for navigation management
            buildAndAttachChoiceAspect.buildAndAttachChoice(wrap);
            //wraps.push(wrap);
        }
    }
}

export function OptionsLoopAspect(dataWrap, optionAttachAspect){ 
    return{
        loop(){
            let options = dataWrap.getOptions();
            for(let i = 0; i<options.length; i++) {
                let option = options[i];
                optionAttachAspect.attach(option);
            } 
        }
    }
}