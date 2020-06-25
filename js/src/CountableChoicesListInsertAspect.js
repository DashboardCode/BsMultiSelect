export function CountableChoicesListInsertAspect(countableChoicesList, wrapsCollection){
    return {
        countableChoicesListInsert(wrap, key){
            let choiceNext = wrapsCollection.getNext(key);
            countableChoicesList.add(wrap, choiceNext)
        }
    }
}