export function ChoicesEnumerableAspect(countableChoicesList, getNext){
    return {
        forEach(f){
            let wrap =  countableChoicesList.getHead(); 
            while(wrap){
                f(wrap);
                wrap = getNext(wrap);
            }
        }
    }
}