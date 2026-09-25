import { useLayoutEffect } from 'react';
import { Modal, View, Pressable, StyleSheet, useWindowDimensions, Platform, StatusBar } from 'react-native';
import { useFloating, offset as floatingOffset, flip, shift } from '@floating-ui/react-native';

const positionReady = {
    name: 'positionReady',
    fn: () => ({ data: { ready: true } }),
};

export default function BasePopover({visible, anchorRef, onClose, placement = 'bottom-start', offset = 0, crossAxisOffset = 0, children, popoverStyle,}) {
    if (!visible) return null;

    return (
        <PopoverLayer
            anchorRef={anchorRef}
            onClose={onClose}
            placement={placement}
            offset={offset}
            crossAxisOffset={crossAxisOffset}
            popoverStyle={popoverStyle}
        >
            {children}
        </PopoverLayer>
    );
}

function PopoverLayer({ anchorRef, onClose, placement, offset, crossAxisOffset, children, popoverStyle }) {
    const { width, height } = useWindowDimensions();

    const { refs, floatingStyles, middlewareData, update } = useFloating({
        placement,

        sameScrollView: false,

        middleware: [
            floatingOffset({
                mainAxis: offset,
                crossAxis: crossAxisOffset,
            }),
            flip({ padding: 8 }),
            shift({ padding: 8 }),
            positionReady,
        ],
    });

    useLayoutEffect(() => {
        refs.setReference(anchorRef?.current ?? null);

        return () => {
            refs.setReference(null);
        };
    }, [anchorRef, refs.setReference]);

    const ready = middlewareData.positionReady?.ready;

    const statusBarOffset = Platform.OS === 'android'
        ? StatusBar.currentHeight ?? 0
        : 0;

    return (
        <Modal
            visible
            transparent
            animationType="none"
            onRequestClose={onClose}
            onShow={update}
        >
            <View ref={refs.setOffsetParent} collapsable={false} style={styles.container}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

                <View
                    ref={refs.setFloating}
                    collapsable={false}
                    onLayout={update}
                    pointerEvents={ready ? 'auto' : 'none'}
                    style={[
                        styles.popover,
                        {
                            maxWidth: Math.max(0, width - 16),
                            maxHeight: Math.max(0, height - 16),
                        },
                        floatingStyles,
                        { top: floatingStyles.top - statusBarOffset },
                        { opacity: ready ? 1 : 0 },
                        popoverStyle,
                    ]}
                >
                    {children}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    popover: {
        position: 'absolute',
    },
});
