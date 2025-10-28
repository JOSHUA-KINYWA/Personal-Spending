# 🔄 Recurring Transactions Feature

## Overview
Automatically manage your recurring bills, subscriptions, and regular income with smart auto-generation!

## ✨ Features Implemented

### 1. **Database Schema** ✅
- New `recurring_transactions` table with:
  - Frequency options: Daily, Weekly, Monthly, Yearly
  - Start date and optional end date
  - Next due date tracking
  - Active/inactive status
  - Auto-mark-paid option
  - Last generated date tracking

### 2. **Full CRUD Operations** ✅
- ✅ Create recurring transactions
- ✅ Edit existing recurring transactions
- ✅ Delete recurring transactions
- ✅ Pause/Resume (toggle active status)
- ✅ Auto-generate transactions when due

### 3. **User Interface** ✅
- **New "Recurring" page** in navigation
- **Beautiful modal** for creating/editing recurring transactions
- **Active/Paused sections** to organize your recurring bills
- **Frequency badges** with color coding
- **Next due date** prominently displayed
- **Quick actions**: Edit, Pause, Delete

### 4. **Auto-Generation Logic** ✅
- Automatically creates transactions based on recurring templates
- **"Generate Due Now"** button to manually trigger generation
- Smart date calculation:
  - Daily: +1 day
  - Weekly: +7 days
  - Monthly: +1 month
  - Yearly: +1 year
- Auto-deactivates when end date is reached

## 🚀 How to Use

### Step 1: Run Database Migration
```sql
-- Copy and paste the updated database.sql into your Supabase SQL Editor
-- This will add the recurring_transactions table
```

### Step 2: Create Your First Recurring Transaction
1. Go to **Dashboard** → Click **"Recurring"** in the navigation
2. Click **"Add Recurring Transaction"**
3. Fill in the details:
   - **Type**: Income or Expense
   - **Amount**: The recurring amount
   - **Description**: e.g., "Netflix Subscription"
   - **Category**: Select appropriate category
   - **Frequency**: Daily, Weekly, Monthly, or Yearly
   - **Start Date**: When it starts
   - **End Date**: (Optional) When it ends
   - **Auto-mark paid**: Check if you want transactions auto-generated

### Step 3: Generate Transactions
**Option A: Manual Generation**
- Click **"Generate Due Now"** button on the Recurring page
- This checks all active recurring transactions and generates those that are due

**Option B: Automatic Generation** (Recommended for Production)
- Set up a cron job or scheduled task to call the generation function
- Example: Run daily at midnight to check and generate due transactions

### Step 4: Manage Your Recurring Transactions
- **Edit**: Update amount, frequency, or other details
- **Pause**: Temporarily stop generation without deleting
- **Activate**: Resume a paused recurring transaction
- **Delete**: Permanently remove the recurring template

## 📊 Use Cases

### Monthly Bills
- Rent: $1,500/month
- Internet: $60/month
- Phone: $45/month
- Streaming services: Various amounts

### Yearly Subscriptions
- Annual software licenses
- Insurance premiums
- Membership fees

### Weekly/Daily Income
- Freelance contracts
- Rental income
- Regular paychecks

## 🎨 Features Breakdown

### 1. Recurring Transaction Modal
- Clean, intuitive form
- Type toggle (Income/Expense)
- Category filtering based on type
- Date pickers for start/end dates
- Frequency dropdown
- Auto-mark-paid checkbox

### 2. Recurring Page
- **Active Section**: Shows all active recurring transactions
- **Paused Section**: Shows inactive/paused recurring transactions
- Frequency badges with color coding
- Next due date displayed
- Quick action buttons

### 3. Auto-Generation
- Checks all active recurring transactions
- Generates transactions for those due today or earlier
- Updates next_due_date automatically
- Handles end dates gracefully
- Adds "(Auto-generated)" to description

## 💡 Pro Tips

1. **Use End Dates**: Set end dates for subscriptions you plan to cancel
2. **Pause Instead of Delete**: Pause seasonal expenses instead of deleting
3. **Regular Review**: Check your recurring list monthly to keep it updated
4. **Descriptive Names**: Use clear descriptions like "Netflix Premium - Family Plan"
5. **Manual Generation**: Click "Generate Due Now" daily to keep transactions up-to-date

## 🔒 Security
- All recurring transactions are user-isolated with RLS policies
- Only you can see and manage your recurring transactions
- Auto-generated transactions follow the same security rules

## 📱 Navigation
- Added "Recurring" link to all page navigation bars:
  - Dashboard
  - Transactions
  - Analytics
  - Recurring (new!)

## 🎯 Next Steps (Optional Enhancements)

Future improvements you could add:
- Email/SMS notifications before bills are due
- Automatic payment integration
- Budget alerts based on upcoming recurring expenses
- Recurring transaction reports and analytics
- Bulk import from CSV
- Templates for common subscriptions

---

**Enjoy stress-free bill management with automatic recurring transactions!** 🎉

