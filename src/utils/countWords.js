function countWords(text) {
    const words = text.match(
        /[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu
    );

    return words?.length ?? 0;
}

export default countWords;