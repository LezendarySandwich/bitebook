import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RootDrawerParamList } from '../navigation/types';
import { useDashboardStore } from '../stores/useDashboardStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useConversationStore } from '../stores/useConversationStore';
import { CalorieRing } from '../components/dashboard/CalorieRing';
import { DailySummary } from '../components/dashboard/DailySummary';
import { WeeklySummary } from '../components/dashboard/WeeklySummary';
import { FoodLogList } from '../components/dashboard/FoodLogList';
import { QuickLogButton } from '../components/dashboard/QuickLogButton';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { colors, spacing, typography } from '../theme';

type NavigationProp = DrawerNavigationProp<RootDrawerParamList, 'Dashboard'>;

export function DashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { todayCalories, weekCalories, weekDayCount, todayEntries, isLoading, loadDashboard } =
    useDashboardStore();
  const { calorieTarget } = useSettingsStore();
  const { createConversation } = useConversationStore();

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [])
  );

  const handleQuickLog = async () => {
    const conversation = await createConversation();
    navigation.navigate('Chat', { conversationId: conversation.id });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <CalorieRing consumed={todayCalories} target={calorieTarget} />

        <View style={styles.summaryRow}>
          <DailySummary consumed={todayCalories} target={calorieTarget} />
          <WeeklySummary
            weekCalories={weekCalories}
            dayCount={weekDayCount}
            target={calorieTarget}
          />
        </View>

        <FoodLogList entries={todayEntries} />
      </ScrollView>

      <QuickLogButton onPress={handleQuickLog} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
});
