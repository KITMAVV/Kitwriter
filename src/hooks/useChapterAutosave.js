import { useEffect, useRef } from 'react';
import { updateChapter } from "../repositories/chaptersRepository";

function useChapterAutosave(chapterId, text, hasUserEdited) {

     const savedTextRef = useRef(text);

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

}


export default useChapterAutosave;
