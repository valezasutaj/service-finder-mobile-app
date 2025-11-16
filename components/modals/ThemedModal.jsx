import React from 'react';
import { Modal, View, TouchableWithoutFeedback, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../context/ThemedModes';

const ThemedModal = ({
    visible,
    onClose,
    children,
    animationType = 'fade',
    transparent = true,
    overlayStyle,
    contentStyle,
    dismissOnOverlayPress = true,
    presentationStyle = 'overFullScreen'
}) => {
    const { theme } = useTheme();

    const handleOverlayPress = () => {
        if (dismissOnOverlayPress) {
            onClose?.();
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={transparent}
            animationType={animationType}
            onRequestClose={onClose}
            presentationStyle={presentationStyle}
            statusBarTranslucent={true}
        >
            <TouchableWithoutFeedback onPress={handleOverlayPress}>
                <View style={[styles.overlay, overlayStyle]}>
                    <View style={[styles.overlayBackground, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]} />

                    <TouchableWithoutFeedback>
                        <View style={[
                            styles.modalContainer,
                            {
                                backgroundColor: theme.cardBackground || theme.background,
                                shadowColor: theme.shadow
                            },
                            contentStyle
                        ]}>
                            {children}
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    overlayBackground: {
        ...StyleSheet.absoluteFillObject,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 16,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
    },
});

export default ThemedModal;