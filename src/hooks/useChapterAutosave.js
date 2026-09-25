import { useEffect, useRef, useCallback } from 'react';
import { updateChapter } from '../repositories/chaptersRepository';
import { useFocusEffect } from '@react-navigation/native';

function useChapterAutosave(chapterId, text, hasUserEdited) {
    const savedTextRef = useRef(text);
    const latestTextRef = useRef(text);
    const editedRef = useRef(hasUserEdited);


    const saveQueueRef = useRef(Promise.resolve());

    useEffect(() => {
        latestTextRef.current = text;
        editedRef.current = hasUserEdited;

        if (!hasUserEdited) {
            savedTextRef.current = text;
        }
    }, [text, hasUserEdited]);


    const saveNow = useCallback(() => {
        const task = saveQueueRef.current
            .catch(() => {})
            .then(async () => {
                if (!editedRef.current) return;

                const textToSave = latestTextRef.current;

                if (savedTextRef.current === textToSave) {
                    return;
                }

                await updateChapter(chapterId, {
                    content_md: textToSave,
                });

                savedTextRef.current = textToSave;

                console.log('Autosave SAVED');
            });

        saveQueueRef.current = task;

        return task;
    }, [chapterId]);

    useFocusEffect(
        useCallback(() => {
            return () => {
                void saveNow().catch(console.error);
            };
        }, [saveNow])
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            void saveNow().catch(console.error);
        }, 2000);

        return () => clearTimeout(timer);
    }, [text, hasUserEdited, saveNow]);

    useEffect(() => {
        const interval = setInterval(() => {
            void saveNow().catch(console.error);
        }, 5000);

        return () => clearInterval(interval);
    }, [saveNow]);

    return saveNow;

}

export default useChapterAutosave;
