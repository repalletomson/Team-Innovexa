import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
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

export default function TransactionsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const transactions = [
    { id: 1, title: 'Salary Deposit', category: 'Income', amount: 5200, type: 'income', date: '2024-01-15', description: 'Monthly salary' },
    { id: 2, title: 'Grocery Store', category: 'Food', amount: -85.50, type: 'expense', date: '2024-01-14', description: 'Weekly groceries' },
    { id: 3, title: 'Gas Station', category: 'Transportation', amount: -45.20, type: 'expense', date: '2024-01-13', description: 'Fuel' },
    { id: 4, title: 'Coffee Shop', category: 'Food', amount: -12.50, type: 'expense', date: '2024-01-13', description: 'Morning coffee' },
    { id: 5, title: 'Freelance Work', category: 'Income', amount: 800, type: 'income', date: '2024-01-12', description: 'Web design project' },
    { id: 6, title: 'Electric Bill', category: 'Utilities', amount: -120.00, type: 'expense', date: '2024-01-11', description: 'Monthly electricity' },
    { id: 7, title: 'Netflix Subscription', category: 'Entertainment', amount: -15.99, type: 'expense', date: '2024-01-10', description: 'Monthly subscription' },
  ];

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'income', label: 'Income' },
    { key: 'expense', label: 'Expense' },
  ];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || transaction.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getCategoryIcon = (category) => {
    const iconMap = {
      'Income': 'cash',
      'Food': 'restaurant',
      'Transportation': 'car',
      'Utilities': 'flash',
      'Entertainment': 'play-circle',
    };
    return iconMap[category] || 'ellipse';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                selectedFilter === filter.key && styles.filterButtonActive
              ]}
              onPress={() => setSelectedFilter(filter.key)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedFilter === filter.key && styles.filterButtonTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.transactionsList}>
          {filteredTransactions.map((transaction) => (
            <TouchableOpacity key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <View style={[
                  styles.transactionIcon,
                  { backgroundColor: transaction.type === 'income' ? colors.success : colors.error }
                ]}>
                  <Ionicons 
                    name={getCategoryIcon(transaction.category)} 
                    size={20} 
                    color={colors.surface} 
                  />
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionTitle}>{transaction.title}</Text>
                  <Text style={styles.transactionCategory}>{transaction.category}</Text>
                  <Text style={styles.transactionDescription}>{transaction.description}</Text>
                </View>
              </View>
              <View style={styles.transactionRight}>
                <Text style={[
                  styles.transactionAmount,
                  { color: transaction.type === 'income' ? colors.success : colors.error }
                ]}>
                  {transaction.type === 'income' ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                </Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {filteredTransactions.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>No transactions found</Text>
            <Text style={styles.emptyStateSubtext}>Try adjusting your search or filter</Text>
          </View>
        )}
      </ScrollView>

      {/* Add Transaction Button */}
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
  header: {
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterButtonTextActive: {
    color: colors.surface,
  },
  scrollView: {
    flex: 1,
    padding: 16,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  transactionCategory: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  transactionDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
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