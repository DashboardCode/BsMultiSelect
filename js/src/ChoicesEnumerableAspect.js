export function ChoicesEnumerableAspect(countableChoicesList, getNext){
    return {
        forEach(f){
            let choice =  countableChoicesList.getHead(); 
            while(choice){
                f(choice);
                choice = getNext(choice);
            }
        }
    }
}