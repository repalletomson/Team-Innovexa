import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
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

export default function DashboardScreen() {
  const accountBalance = 12450.75;
  const monthlyIncome = 5200.00;
  const monthlyExpenses = 3180.25;

  const quickActions = [
    { icon: 'add-circle', title: 'Add Income', color: colors.success },
    { icon: 'remove-circle', title: 'Add Expense', color: colors.error },
    { icon: 'swap-horizontal', title: 'Transfer', color: colors.warning },
    { icon: 'card', title: 'Pay Bills', color: colors.primary },
  ];

  const recentTransactions = [
    { id: 1, title: 'Salary Deposit', amount: 5200, type: 'income', date: 'Today' },
    { id: 2, title: 'Grocery Store', amount: -85.50, type: 'expense', date: 'Yesterday' },
    { id: 3, title: 'Gas Station', amount: -45.20, type: 'expense', date: '2 days ago' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>${accountBalance.toLocaleString()}</Text>
          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceSubLabel}>Income</Text>
              <Text style={[styles.balanceSubAmount, { color: colors.success }]}>
                +${monthlyIncome.toLocaleString()}
              </Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceSubLabel}>Expenses</Text>
              <Text style={[styles.balanceSubAmount, { color: colors.error }]}>
                -${monthlyExpenses.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity key={index} style={styles.quickActionItem}>
                <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                  <Ionicons name={action.icon} size={24} color={colors.surface} />
                </View>
                <Text style={styles.quickActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.transactionsList}>
            {recentTransactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionLeft}>
                  <View style={[
                    styles.transactionIcon,
                    { backgroundColor: transaction.type === 'income' ? colors.success : colors.error }
                  ]}>
                    <Ionicons 
                      name={transaction.type === 'income' ? 'arrow-down' : 'arrow-up'} 
                      size={16} 
                      color={colors.surface} 
                    />
                  </View>
                  <View>
                    <Text style={styles.transactionTitle}>{transaction.title}</Text>
                    <Text style={styles.transactionDate}>{transaction.date}</Text>
                  </View>
                </View>
                <Text style={[
                  styles.transactionAmount,
                  { color: transaction.type === 'income' ? colors.success : colors.error }
                ]}>
                  {transaction.type === 'income' ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
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
  balanceCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  balanceLabel: {
    color: colors.surface,
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 8,
  },
  balanceAmount: {
    color: colors.surface,
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceItem: {
    flex: 1,
  },
  balanceSubLabel: {
    color: colors.surface,
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  balanceSubAmount: {
    fontSize: 18,
    fontWeight: '600',
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
  seeAllText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionItem: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  transactionsList: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});