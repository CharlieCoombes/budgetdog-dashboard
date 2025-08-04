# Monthly Take Rate Calculator

This script helps calculate the actual take rate by cross-checking new Budgetdog Academy member emails against Stripe trial signups.

## Monthly Process

### 1. Prepare the Data
When you receive new member emails from your partner:
1. Open `scripts/new-members.txt`
2. Replace the example content with the actual emails (one per line)
3. Save the file

### 2. Run the Calculation
```bash
cd "/Users/charliecoombes/Desktop/budgetdog reporting/budgetdog-dashboard"
node scripts/calculate-take-rate.js
```

### 3. Review Results
The script will show:
- Total new Academy members
- How many started Avery trials  
- Calculated take rate percentage
- Detailed breakdown of who signed up
- List of members who didn't sign up

### 4. Update Dashboard
The script will tell you exactly what values to update in the dashboard code:
- `take_rate`: The calculated percentage
- `avery_signups`: Number who started trials
- `new_bda_students`: Total new members

### 5. Deploy Changes
After updating the code, redeploy to see the new take rate on your dashboard.

## Files Created
- `take-rate-YYYY-MM-DD.json`: Detailed results for your records
- Monthly history for tracking trends

## Example Output
```
📊 TAKE RATE CALCULATION RESULTS
==================================================
Total new Budgetdog Academy members: 150
Members who started Avery trials: 23
Take Rate: 15.3%
==================================================
```