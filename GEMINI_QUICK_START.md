# 🚀 Gemini API Quick Start Guide

Get your AI-powered features working in under 2 minutes!

---

## Step 1: Get Your FREE Gemini API Key

1. Visit **[Google AI Studio](https://aistudio.google.com/apikey)**
2. Sign in with your Google account
3. Click **"Create API key"** or **"Get API key"**
4. Copy the entire key (it starts with `AIza...`)

💡 **Tip**: The free tier includes generous limits - perfect for personal use!

---

## Step 2: Configure Your App

### Option A: In-App Configuration (Recommended)

1. Open your Command Center app
2. Navigate to **Settings ⚙️** (bottom navigation)
3. Scroll to **"Gemini API Configuration"**
4. Paste your API key in the password field
5. Click **"Save Encrypted Key"** 🔐

✅ Your key is now encrypted and securely stored!

### Option B: Environment Variable (For Developers)

1. Create a `.env` file in your project root
2. Add this line:
   ```
   VITE_GEMINI_API_KEY=AIza...your_key_here
   ```
3. Restart your development server

---

## Step 3: Test Your Connection

1. In **Settings → Gemini API Configuration**
2. Click **"Test Connection"** button
3. Look for the success message: **"✓ Gemini connection successful!"**

If you see an error, check the message for specific guidance.

---

## Step 4: Start Using AI Features! 🎉

All AI-powered features now work seamlessly:

### 💪 **Workouts**
- Generate personalized workout plans
- Specify duration, focus, difficulty
- Example: *"Create a 30-minute upper body workout"*

### 🧠 **Knox (Life Coach)**
- Deep conversations about life goals
- Challenge your assumptions
- Get brutally honest feedback

### 💰 **Finance**
- Generate personalized budgets
- AI financial advisor interview
- Smart expense categorization

### ⛳ **Golf Swing Analyzer**
- Upload swing videos
- Get AI-powered feedback
- Compare swings side-by-side

---

## Troubleshooting

### ❌ "API key appears invalid"
**Fix**: Make sure you copied the entire key from Google AI Studio. Keys are usually 39 characters long and start with `AIza`.

### ❌ "API key format incorrect"
**Fix**: Verify you're using a **Gemini API key** (starts with `AI`), not a different Google API key.

### ❌ "Invalid API key"
**Fix**: The key isn't recognized by Google. Try:
1. Generating a new key at [Google AI Studio](https://aistudio.google.com/apikey)
2. Making sure your Google account has API access enabled

### ❌ "Decryption failed"
**Fix**: Your stored key got corrupted. Click **"Remove Key"** and add it again.

### ❌ "API quota exceeded"
**Fix**: You've hit your free tier limits. Options:
- Wait for quota reset (resets monthly)
- Upgrade to paid tier
- Use the built-in Spark LLM (always available)

---

## Understanding Your AI Providers

Your app supports **two AI providers**:

### 🌟 **Spark LLM (GPT-4o)** - Default
- Always available
- No configuration needed
- Fast and reliable
- Used by: All modules

### 🧠 **Google Gemini 2.0** - Optional
- Requires API key
- Long context window (1M tokens)
- Cost-effective
- Great for complex tasks

### 🔄 **Automatic** - Smart Choice
The app can automatically choose the best provider for each task:
- Short prompts → Spark LLM (faster)
- Long prompts → Gemini (better for context)
- If one fails → Automatically tries the other

**To enable**: Go to Settings → AI Provider Preferences → Select "Automatic"

---

## Privacy & Security 🔒

### Your API Key is Secure

When you save your API key in the app:
- ✅ **Encrypted using AES-GCM 256-bit encryption**
- ✅ **Device-specific encryption key** (PBKDF2 with 100,000 iterations)
- ✅ **Only decrypted in-memory** when making AI requests
- ✅ **Never sent anywhere** except directly to Google's API

### What Data Gets Sent to AI?

- **Your prompts**: The text you enter (workouts, questions, etc.)
- **Your profile data**: Only what you explicitly provide
- **No tracking**: Your conversations aren't logged or analyzed

### Who Can See Your Data?

- **You**: Full access to all your data
- **Google (Gemini)**: Only sees prompts you send
- **OpenAI (Spark)**: Only sees prompts you send
- **Us**: We don't store or see your data

---

## Usage & Costs

### Free Tier (Gemini)
- **60 requests per minute**
- **1,500 requests per day**
- **1 million requests per month**
- Perfect for personal use! 🎉

### Paid Tier (Optional)
Only needed if you're a power user:
- $0.075 per 1 million input tokens
- $0.30 per 1 million output tokens
- Still very cheap!

### Cost Tracking
Monitor your usage in **Settings → AI Usage Statistics**:
- Request counts
- Token usage
- Estimated costs

---

## Tips for Best Results

### 💪 Workout Generation
- Be specific: *"15-minute HIIT workout for beginners"*
- Include equipment: *"Upper body workout with dumbbells"*
- Specify difficulty: *"Advanced core workout"*

### 🧠 Knox Conversations
- Be honest and vulnerable
- Ask deep questions
- Don't hold back

### 💰 Budget Planning
- Provide accurate income data
- Be honest about spending habits
- Share your financial goals

### ⛳ Golf Analysis
- Use good lighting
- Film full swing from side view
- Include backswing and follow-through

---

## Need Help?

### Common Questions

**Q: Do I need a Gemini API key?**
A: No! The app works great with just Spark LLM. Gemini is optional for cost-conscious users.

**Q: Can I use both providers?**
A: Yes! Set your preference to "Automatic" and the app will choose the best option.

**Q: Will this work offline?**
A: No, AI features require internet connection.

**Q: Can I change my API key later?**
A: Yes! Just go to Settings and save a new key.

**Q: What happens if my key stops working?**
A: The app will automatically fall back to Spark LLM.

---

## Ready to Go! 🎯

You're all set! Your AI-powered command center is ready to:
- ✅ Generate custom workouts
- ✅ Have deep conversations with Knox
- ✅ Create personalized budgets
- ✅ Analyze golf swings
- ✅ And more!

**Questions?** Check the full documentation in `API_DIAGNOSTIC_AND_FIX.md`

---

**Enjoy your AI-powered productivity! 🚀**
