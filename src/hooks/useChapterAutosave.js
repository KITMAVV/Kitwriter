import { useEffect, useRef } from 'react';
import { updateChapter } from "../repositories/chaptersRepository";

function useChapterAutosave(chapterId, text, hasUserEdited) {

     const savedTextRef = useRef(text);
     const latestTextRef = useRef(text);
    

    useEffect(() => {
        latestTextRef.current = text;
    }, [text]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (!hasUserEdited) {
                return;
            }

            if(savedTextRef.current === text) {
                return
            }

            await updateChapter(chapterId, {content_md: text,});

            savedTextRef.current = text;
            console.log('Autosave SAVED')
        }, 2000);
        
        return () => clearTimeout(timer);

    }, [text, chapterId, hasUserEdited]);

    useEffect(() => {
        const interval = setInterval(async () => {
            if (!hasUserEdited) {
                return;
            }

            if(savedTextRef.current === latestTextRef.current) {
                return;
            }

            const textToSave = latestTextRef.current;
            await updateChapter(chapterId, {content_md: textToSave,});
            savedTextRef.current = textToSave;

            console.log('5 sec Autosave SAVED')
        }, 5000);

        return () => clearInterval(interval);

    }, [chapterId, hasUserEdited]);

}


export default useChapterAutosave;
