import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { FoodEntry } from '../../types/database';
import { colors, spacing, typography } from '../../theme';

interface EditFoodEntryModalProps {
  entry: FoodEntry | null;
  onSave: (id: number, updates: { name: string; calories: number; quantity: number }) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}

export function EditFoodEntryModal({ entry, onSave, onDelete, onClose }: EditFoodEntryModalProps) {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    if (entry) {
      setName(entry.name);
      setCalories(String(entry.calories));
      setQuantity(String(entry.quantity));
    }
  }, [entry]);

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Invalid Input', 'Name cannot be empty.');
      return;
    }

    const parsedCalories = parseInt(calories, 10);
    if (isNaN(parsedCalories) || parsedCalories <= 0) {
      Alert.alert('Invalid Input', 'Calories must be a positive number.');
      return;
    }

    const parsedQuantity = parseFloat(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      Alert.alert('Invalid Input', 'Quantity must be a positive number.');
      return;
    }

    onSave(entry!.id, { name: trimmedName, calories: parsedCalories, quantity: parsedQuantity });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Entry',
      `Are you sure you want to delete "${entry?.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(entry!.id),
        },
      ]
    );
  };

  return (
    <Modal visible={entry !== null} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit Food Entry</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeButton}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Food name"
            placeholderTextColor={colors.textLight}
          />

          <Text style={styles.label}>Calories</Text>
          <TextInput
            style={styles.input}
            value={calories}
            onChangeText={setCalories}
            placeholder="Calories"
            placeholderTextColor={colors.textLight}
            keyboardType="number-pad"
          />

          <Text style={styles.label}>Quantity</Text>
          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
            placeholder="Quantity"
            placeholderTextColor={colors.textLight}
            keyboardType="decimal-pad"
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete Entry</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  closeButton: {
    ...typography.body,
    color: colors.primary,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  saveButtonText: {
    ...typography.button,
    color: colors.textOnPrimary,
  },
  deleteButton: {
    alignItems: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  deleteButtonText: {
    ...typography.button,
    color: colors.error,
  },
});
