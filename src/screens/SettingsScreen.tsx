import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useModelStore, MODEL_CATALOG } from '../stores/useModelStore';
import { ModelCard } from '../components/settings/ModelCard';
import { colors, spacing, typography } from '../theme';

export function SettingsScreen() {
  const { calorieTarget, setCalorieTarget } = useSettingsStore();
  const { modelStates, activeModelId, startDownload, deleteModel, activateModel } =
    useModelStore();
  const [targetInput, setTargetInput] = useState(calorieTarget.toString());

  const handleSaveTarget = () => {
    const value = parseInt(targetInput, 10);
    if (isNaN(value) || value <= 0) {
      Alert.alert('Invalid Target', 'Please enter a valid calorie target.');
      return;
    }
    setCalorieTarget(value);
    Alert.alert('Saved', `Daily target set to ${value} calories.`);
  };

  const handleDownload = (modelId: string) => {
    startDownload(modelId);
  };

  const handleDelete = (modelId: string) => {
    Alert.alert(
      'Delete Model',
      'Are you sure you want to delete this model?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteModel(modelId) },
      ]
    );
  };

  const handleActivate = (modelId: string) => {
    activateModel(modelId);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Daily Calorie Target</Text>
      <View style={styles.targetRow}>
        <TextInput
          style={styles.targetInput}
          value={targetInput}
          onChangeText={setTargetInput}
          keyboardType="number-pad"
          placeholder="2000"
          returnKeyType="done"
        />
        <Text style={styles.targetUnit}>cal</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveTarget}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>LLM Models</Text>
      <Text style={styles.sectionDescription}>
        Download a model to start using BiteBook. Models run locally on your device.
      </Text>

      {MODEL_CATALOG.map((model) => (
        <ModelCard
          key={model.id}
          model={model}
          state={modelStates[model.id] ?? { status: 'not_downloaded', progress: 0 }}
          isActive={model.id === activeModelId}
          onDownload={() => handleDownload(model.id)}
          onDelete={() => handleDelete(model.id)}
          onActivate={() => handleActivate(model.id)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  sectionDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  targetInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
  },
  targetUnit: {
    ...typography.body,
    color: colors.textSecondary,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  saveButtonText: {
    ...typography.button,
    color: colors.textOnPrimary,
  },
});
