import { Category } from '../types';

export const ALL_CATEGORIES: Category[] = [
  'Food',
  'Travel',
  'Shopping',
  'Bills',
  'Recharge',
  'Entertainment',
  'Subscriptions',
  'Health',
  'Education',
  'Investments',
  'Transfers',
  'Income',
  'Others',
];

export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Food: ['swiggy', 'zomato', 'dominos', 'pizza', 'kfc', 'mcdonalds', 'burger', 'restaurant', 'cafe', 'food', 'eat', 'meal', 'starbucks', 'dunkin', 'subway', 'biryani', 'chai', 'bakery', 'blinkit', 'zepto', 'instamart', 'grofers', 'bigbasket', 'grocery'],
  Travel: ['uber', 'ola', 'rapido', 'auto', 'cab', 'taxi', 'irctc', 'railway', 'train', 'bus', 'redbus', 'airline', 'flight', 'indigo', 'spicejet', 'air india', 'petrol', 'fuel', 'toll', 'metro', 'makemytrip', 'goibibo', 'yatra'],
  Shopping: ['amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'meesho', 'snapdeal', 'shopify', 'retail', 'store', 'mall', 'shop', 'purchase', 'buy'],
  Bills: ['electricity', 'water', 'gas', 'broadband', 'internet', 'bsnl', 'jio', 'airtel', 'vi', 'vodafone', 'idea', 'bill', 'utility', 'emi', 'loan', 'insurance'],
  Recharge: ['recharge', 'prepaid', 'topup', 'top-up', 'mobile recharge', 'dth', 'tataplay', 'dish tv', 'sun direct'],
  Entertainment: ['netflix', 'amazon prime', 'hotstar', 'disney', 'zee5', 'sonyliv', 'jiocinema', 'youtube', 'bookmyshow', 'pvr', 'inox', 'cinema', 'movie', 'concert', 'event'],
  Subscriptions: ['spotify', 'apple music', 'gaana', 'wynk', 'chatgpt', 'openai', 'notion', 'subscription', 'premium', 'plus'],
  Health: ['pharmacy', 'medical', 'hospital', 'clinic', 'doctor', 'medicine', 'apollo', 'netmeds', 'pharmeasy', '1mg', 'gym', 'fitness', 'healthkart'],
  Education: ['udemy', 'coursera', 'unacademy', 'byju', 'vedantu', 'school', 'college', 'tuition', 'course', 'book', 'education'],
  Investments: ['zerodha', 'groww', 'upstox', 'coin', 'mutual fund', 'sip', 'stocks', 'nifty', 'sensex', 'fd', 'ppf', 'nps'],
  Transfers: ['transfer', 'sent to', 'send money', 'neft', 'imps', 'rtgs', 'upi transfer'],
  Income: ['received', 'salary', 'credit', 'cashback', 'refund', 'interest earned'],
  Others: [],
};

export const EXPENSE_TYPES: Category[] = ['Food', 'Travel', 'Shopping', 'Bills', 'Recharge', 'Entertainment', 'Subscriptions', 'Health', 'Education', 'Investments', 'Others'];
export const INCOME_TYPES: Category[] = ['Income'];
export const TRANSFER_TYPES: Category[] = ['Transfers'];
