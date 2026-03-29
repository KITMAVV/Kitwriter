// получает масив items
// получает ключик для просмотра масива nameKey
// получает дефолтное имя baseName

// Пример:
// generateUniqueName(books, "book_name", "Книга");

function generateUniqueName(items, nameKey, baseName, startFromOne = false) {

    let baseExists = startFromOne;
    const numbers = [];

    for(const object of items) {
        const name = object[nameKey]

        if ( name === baseName) {
            baseExists = true;
        } else if ( name.startsWith(baseName + " ")) {
            const parts = name.split(" ");
            const numberText = parts[1];
            const number = Number(numberText);

            if ( !Number.isNaN(number) ) {
                numbers.push(number);
            }
            
        }
    }

    if ( baseExists === false) {
        return baseName;
    }
    
    if ( numbers.length === 0 ){
        return baseName + " 1";
    }

    const maxNumber = Math.max(...numbers);
    return baseName + " " + (maxNumber + 1);
}

export default generateUniqueName;