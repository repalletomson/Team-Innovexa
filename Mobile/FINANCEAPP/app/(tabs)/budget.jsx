import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const colors = {
  primary: '#2E7D32',
  secondary: '#4CAF50',
  accent: '#81C784',
  background: '#F1F8E9',
  surface: '#FFFFFF',
  text: '#1B5E20',
  textSecondary: '#388E3C',
  border: '#C8E6C9',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
};

const { width } = Dimensions.get('window');

export default function BudgetScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  const budgetData = [
    {
      category: 'Food & Dining',
      budgeted: 800,
      spent: 650,
      icon: 'restaurant',
      color: colors.success,
    },
    {
      category: 'Transportation',
      budgeted: 400,
      spent: 380,
      icon: 'car',
      color: colors.warning,
    },
    {
      category: 'Entertainment',
      budgeted: 300,
      spent: 420,
      icon: 'play-circle',
      color: colors.error,
    },
    {
      category: 'Utilities',
      budgeted: 250,
      spent: 220,
      icon: 'flash',
      color: colors.success,
    },
    {
      category: 'Shopping',
      budgeted: 500,
      spent: 680,
      icon: 'bag',
      color: colors.error,
    },
    {
      category: 'Healthcare',
      budgeted: 200,
      spent: 150,
      icon: 'medical',
      color: colors.success,
    },
  ];

  const totalBudgeted = budgetData.reduce((sum, item) => sum + item.budgeted, 0);
  const totalSpent = budgetData.reduce((sum, item) => sum + item.spent, 0);
  const remaining = totalBudgeted - totalSpent;

  const periods = [
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'yearly', label: 'Yearly' },
  ];

  const getProgressColor = (spent, budgeted) => {
    const percentage = (spent / budgeted) * 100;
    if (percentage <= 70) return colors.success;
    if (percentage <= 90) return colors.warning;
    return colors.error;
  };

  const getProgressPercentage = (spent, budgeted) => {
    return Math.min((spent / budgeted) * 100, 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodButton,
                selectedPeriod === period.key && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period.key)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period.key && styles.periodButtonTextActive
              ]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Budget Overview */}
        <View style={styles.overviewCard}>
          <Text style={styles.overviewTitle}>Budget Overview</Text>
          <View style={styles.overviewStats}>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatLabel}>Budgeted</Text>
              <Text style={[styles.overviewStatValue, { color: colors.primary }]}>
                ${totalBudgeted.toLocaleString()}
              </Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatLabel}>Spent</Text>
              <Text style={[styles.overviewStatValue, { color: colors.error }]}>
                ${totalSpent.toLocaleString()}
              </Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatLabel}>Remaining</Text>
              <Text style={[
                styles.overviewStatValue, 
                { color: remaining >= 0 ? colors.success : colors.error }
              ]}>
                ${Math.abs(remaining).toLocaleString()}
              </Text>
            </View>
          </View>
          
          {/* Overall Progress Bar */}
          <View style={styles.overallProgressContainer}>
            <View style={styles.overallProgressBar}>
              <View 
                style={[
                  styles.overallProgressFill,
                  { 
                    width: `${getProgressPercentage(totalSpent, totalBudgeted)}%`,
                    backgroundColor: getProgressColor(totalSpent, totalBudgeted)
                  }
                ]}
              />
            </View>
            <Text style={styles.overallProgressText}>
              {Math.round((totalSpent / totalBudgeted) * 100)}% of budget used
            </Text>
          </View>
        </View>

        {/* Budget Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Budget Categories</Text>
            <TouchableOpacity>
              <Ionicons name="add-circle" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.categoriesList}>
            {budgetData.map((item, index) => (
              <TouchableOpacity key={index} style={styles.categoryItem}>
                <View style={styles.categoryLeft}>
                  <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
                    <Ionicons name={item.icon} size={20} color={colors.surface} />
                  </View>
                  <View style={styles.categoryDetails}>
                    <Text style={styles.categoryName}>{item.category}</Text>
                    <Text style={styles.categoryAmount}>
                      ${item.spent.toLocaleString()} of ${item.budgeted.toLocaleString()}
                    </Text>
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progressFill,
                            { 
                              width: `${getProgressPercentage(item.spent, item.budgeted)}%`,
                              backgroundColor: getProgressColor(item.spent, item.budgeted)
                            }
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {Math.round(getProgressPercentage(item.spent, item.budgeted))}%
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.categoryRight}>
                  <Text style={[
                    styles.remainingAmount,
                    { color: item.spent <= item.budgeted ? colors.success : colors.error }
                  ]}>
                    {item.spent <= item.budgeted ? '+' : '-'}$
                    {Math.abs(item.budgeted - item.spent).toLocaleString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Add Budget Button */}
      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add" size={24} color={colors.surface} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  periodButtonTextActive: {
    color: colors.surface,
  },
  overviewCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  overviewStat: {
    alignItems: 'center',
  },
  overviewStatLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  overviewStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  overallProgressContainer: {
    marginTop: 16,
  },
  overallProgressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginBottom: 8,
  },
  overallProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  overallProgressText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  categoriesList: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  categoryAmount: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    width: 35,
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  remainingAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});