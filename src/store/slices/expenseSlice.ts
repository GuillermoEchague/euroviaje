import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Expense } from '../../domain/models';

interface ExpenseState {
  expenses: Expense[];
  isLoading: boolean;
}

const initialState: ExpenseState = {
  expenses: [],
  isLoading: false,
};

const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    setExpenses: (state, action: PayloadAction<Expense[]>) => {
      state.expenses = action.payload;
    },
    addExpense: (state, action: PayloadAction<Expense>) => {
      state.expenses.unshift(action.payload);
    },
    updateExpense: (state, action: PayloadAction<Expense>) => {
      const index = state.expenses.findIndex(e => e.id === action.payload.id);
      if (index !== -1) {
        state.expenses[index] = action.payload;
      }
    },
    removeExpense: (state, action: PayloadAction<number>) => {
      state.expenses = state.expenses.filter(e => e.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setExpenses, addExpense, updateExpense, removeExpense, setLoading } = expenseSlice.actions;
export default expenseSlice.reducer;
