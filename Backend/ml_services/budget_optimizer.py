import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from models.transaction_model import Transaction
from models.budget_model import Budget
import logging

logger = logging.getLogger(__name__)

class BudgetOptimizer:
    """ML service for optimizing budget allocation"""
    
    def __init__(self):
        self.transaction_model = Transaction()
        self.budget_model = Budget()
    
    def optimize_user_budget(self, user_id, target_savings=0.2, priority_categories=None):
        """Optimize budget allocation based on spending patterns"""
        try:
            # Get user's transaction history
            transactions_result = self.transaction_model.get_user_transactions(
                user_id, page=1, limit=1000
            )
            
            if not transactions_result or not transactions_result['transactions']:
                return None
            
            df = pd.DataFrame(transactions_result['transactions'])
            
            # Separate income and expenses
            income_df = df[df['type'] == 'income']
            expenses_df = df[df['type'] == 'expense']
            
            if len(expenses_df) == 0:
                return None
            
            # Calculate monthly averages
            monthly_income = income_df['amount'].sum() / max(1, len(income_df.groupby(
                pd.to_datetime(income_df['date']).dt.to_period('M')
            )))
            
            # Analyze spending by category
            category_analysis = self._analyze_category_spending(expenses_df)
            
            # Calculate optimal budget allocation
            optimization = self._calculate_optimal_allocation(
                category_analysis, monthly_income, target_savings, priority_categories
            )
            
            return optimization
            
        except Exception as e:
            logger.error(f"Error optimizing budget: {e}")
            return None
    
    def _analyze_category_spending(self, expenses_df):
        """Analyze spending patterns by category"""
        try:
            expenses_df['date'] = pd.to_datetime(expenses_df['date'])
            
            # Group by category and month
            monthly_spending = expenses_df.groupby([
                expenses_df['date'].dt.to_period('M'), 'category'
            ])['amount'].sum().reset_index()
            
            # Calculate statistics for each category
            category_stats = {}
            
            for category in expenses_df['category'].unique():
                category_data = monthly_spending[monthly_spending['category'] == category]['amount']
                
                if len(category_data) > 0:
                    category_stats[category] = {
                        'avg_monthly': category_data.mean(),
                        'std_monthly': category_data.std(),
                        'min_monthly': category_data.min(),
                        'max_monthly': category_data.max(),
                        'total_spent': expenses_df[expenses_df['category'] == category]['amount'].sum(),
                        'transaction_count': len(expenses_df[expenses_df['category'] == category]),
                        'variability': category_data.std() / category_data.mean() if category_data.mean() > 0 else 0
                    }
            
            return category_stats
            
        except Exception as e:
            logger.error(f"Error analyzing category spending: {e}")
            return {}
    
    def _calculate_optimal_allocation(self, category_analysis, monthly_income, target_savings, priority_categories):
        """Calculate optimal budget allocation"""
        try:
            if not category_analysis:
                return None
            
            # Calculate total current spending
            total_spending = sum(stats['avg_monthly'] for stats in category_analysis.values())
            
            # Calculate target spending (income - savings)
            target_spending = monthly_income * (1 - target_savings)
            
            # If current spending is within target, optimize distribution
            if total_spending <= target_spending:
                optimization_type = 'rebalance'
                spending_adjustment = 0
            else:
                optimization_type = 'reduce'
                spending_adjustment = total_spending - target_spending
            
            # Generate optimized budget
            optimized_budget = {}
            recommendations = []
            
            for category, stats in category_analysis.items():
                current_avg = stats['avg_monthly']
                variability = stats['variability']
                
                if optimization_type == 'reduce':
                    # Reduce spending, prioritizing high-variability categories
                    if priority_categories and category in priority_categories:
                        # Protect priority categories
                        reduction_factor = 0.05  # 5% reduction
                    else:
                        # Higher reduction for more variable categories
                        reduction_factor = min(0.3, 0.1 + (variability * 0.2))
                    
                    optimized_amount = current_avg * (1 - reduction_factor)
                    
                    recommendations.append({
                        'category': category,
                        'type': 'reduce',
                        'current_budget': current_avg,
                        'recommended_budget': optimized_amount,
                        'reduction_amount': current_avg - optimized_amount,
                        'reduction_percentage': reduction_factor * 100
                    })
                    
                else:
                    # Rebalance - add buffer for high-variability categories
                    buffer_factor = min(0.2, variability * 0.1)
                    optimized_amount = current_avg * (1 + buffer_factor)
                    
                    recommendations.append({
                        'category': category,
                        'type': 'rebalance',
                        'current_budget': current_avg,
                        'recommended_budget': optimized_amount,
                        'buffer_amount': optimized_amount - current_avg,
                        'buffer_percentage': buffer_factor * 100
                    })
                
                optimized_budget[category] = {
                    'recommended_amount': optimized_amount,
                    'current_average': current_avg,
                    'variability_score': variability,
                    'priority': category in (priority_categories or [])
                }
            
            # Calculate savings potential
            total_optimized = sum(budget['recommended_amount'] for budget in optimized_budget.values())
            potential_savings = monthly_income - total_optimized
            actual_savings_rate = potential_savings / monthly_income if monthly_income > 0 else 0
            
            return {
                'optimization_type': optimization_type,
                'monthly_income': monthly_income,
                'current_spending': total_spending,
                'target_spending': target_spending,
                'optimized_spending': total_optimized,
                'potential_savings': potential_savings,
                'target_savings_rate': target_savings,
                'actual_savings_rate': actual_savings_rate,
                'optimized_budget': optimized_budget,
                'recommendations': recommendations,
                'summary': {
                    'total_categories': len(optimized_budget),
                    'categories_to_reduce': len([r for r in recommendations if r['type'] == 'reduce']),
                    'categories_to_rebalance': len([r for r in recommendations if r['type'] == 'rebalance']),
                    'meets_savings_goal': actual_savings_rate >= target_savings
                }
            }
            
        except Exception as e:
            logger.error(f"Error calculating optimal allocation: {e}")
            return None
    
    def get_budget_recommendations(self, user_id):
        """Get general budget recommendations"""
        try:
            # Get current budgets
            current_budgets = self.budget_model.get_user_budgets(user_id)
            
            # Get spending analysis
            transactions_result = self.transaction_model.get_user_transactions(
                user_id, page=1, limit=500
            )
            
            if not transactions_result or not transactions_result['transactions']:
                return None
            
            df = pd.DataFrame(transactions_result['transactions'])
            expenses_df = df[df['type'] == 'expense']
            
            recommendations = []
            
            # Analyze spending patterns
            category_spending = expenses_df.groupby('category')['amount'].agg(['sum', 'count', 'mean']).to_dict('index')
            
            for category, stats in category_spending.items():
                avg_amount = stats['mean']
                total_spent = stats['sum']
                transaction_count = stats['count']
                
                # Find corresponding budget
                current_budget = next((b for b in (current_budgets or []) if b['category'] == category), None)
                
                if current_budget:
                    # Compare with current budget
                    if current_budget['spent'] > current_budget['amount']:
                        recommendations.append({
                            'type': 'over_budget',
                            'category': category,
                            'message': f"Consider increasing {category} budget or reducing spending",
                            'current_budget': current_budget['amount'],
                            'actual_spending': current_budget['spent'],
                            'suggested_budget': current_budget['spent'] * 1.1
                        })
                else:
                    # Suggest creating budget
                    suggested_amount = total_spent * 1.2  # 20% buffer
                    recommendations.append({
                        'type': 'create_budget',
                        'category': category,
                        'message': f"Consider creating a budget for {category}",
                        'suggested_budget': suggested_amount,
                        'based_on_spending': total_spent
                    })
            
            return {
                'recommendations': recommendations,
                'analysis_period': '30 days',
                'total_recommendations': len(recommendations)
            }
            
        except Exception as e:
            logger.error(f"Error getting budget recommendations: {e}")
            return None