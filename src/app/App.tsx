import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { RootNavigator } from '../navigation/RootNavigator';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useConversationStore } from '../stores/useConversationStore';
import { useModelStore } from '../stores/useModelStore';

export default function App() {
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const loadConversations = useConversationStore((s) => s.loadConversations);
  const loadModelStates = useModelStore((s) => s.loadModelStates);

  useEffect(() => {
    loadSettings();
    loadConversations();
    loadModelStates();
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
