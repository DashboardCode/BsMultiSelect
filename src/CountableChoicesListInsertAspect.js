export function CountableChoicesListInsertAspect(wrapsCollection, countableChoicesList){
    return {
        countableChoicesListInsert(wrap, key){
            let choiceNext = wrapsCollection.getNext(key);
            countableChoicesList.add(wrap, choiceNext)
        }
    }
}