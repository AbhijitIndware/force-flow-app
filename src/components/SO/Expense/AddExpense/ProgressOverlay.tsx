import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import React from 'react';
import { Colors } from '../../../../utils/colors';
import { Fonts } from '../../../../constants';
import { Size } from '../../../../utils/fontSize';

type Props = {
    visible: boolean;
    step: string;
};

export const ProgressOverlay = ({ visible, step }: Props) => {
    if (!visible) return null;
    return (
        <View style={styles.overlay}>
            <View style={styles.card}>
                <ActivityIndicator size="large" color={Colors.orange} />
                <Text style={styles.title}>Please wait</Text>
                <Text style={styles.subtitle}>{step}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        width: '80%',
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        gap: 15,
    },
    title: {
        fontFamily: Fonts.bold,
        fontSize: Size.sm,
        color: Colors.darkButton,
    },
    subtitle: {
        fontFamily: Fonts.medium,
        fontSize: Size.sm,
        color: Colors.gray,
        textAlign: 'center',
    },
});