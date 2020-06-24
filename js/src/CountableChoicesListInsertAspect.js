export function CountableChoicesListInsertAspect(countableChoicesList, wrapsCollection){
    return {
        countableChoicesListInsert(choice, key){
            let choiceNext = wrapsCollection.getNext(key);
            countableChoicesList.add(choice, choiceNext)
        }
    }
}