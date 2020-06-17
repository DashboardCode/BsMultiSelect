export function CountableChoicesListInsertAspect(countableChoicesList){
    return {
        countableChoicesListInsert(choice, key){
            let choiceNext = choicesCollection.getNext(key);
            countableChoicesList.add(choice, choiceNext)
        }
    }
}