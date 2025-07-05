# 📱 Mobile VoicemailAI Testing Guide

## 🔗 **Testing Environment**
- **URL**: http://localhost:3001
- **Mobile Testing**: Use browser dev tools or real mobile device
- **Best View**: Mobile viewport (375x667 or 414x896)

---

## 🧪 **Step-by-Step Testing Instructions**

### **📱 Step 1: Set Up Mobile View**

1. Open your browser (Chrome recommended)
2. Go to http://localhost:3001
3. Open Developer Tools (F12)
4. Click the mobile device icon (📱) in dev tools
5. Select "iPhone SE" or "iPhone 11" from the device dropdown
6. Refresh the page

---

### **🔐 Step 2: Test Enhanced Authentication**

#### **Test 2a: Mobile Login Page**
1. **Navigate to**: http://localhost:3001/mobile-v3/auth/login
2. **What to test**:
   - ✅ Mobile-optimized design loads
   - ✅ Touch-friendly input fields
   - ✅ Password visibility toggle works
   - ✅ Form validation (try empty fields)
   - ✅ "Wachtwoord vergeten?" link works

#### **Test 2b: Forgot Password Flow**
1. **Click**: "Wachtwoord vergeten?" on login page
2. **Should navigate to**: `/mobile-v3/auth/forgot-password`
3. **What to test**:
   - ✅ Beautiful animated form loads
   - ✅ Enter any email address
   - ✅ Success message appears
   - ✅ "Terug naar inloggen" button works

#### **Test 2c: Reset Password Page**
1. **Navigate to**: http://localhost:3001/mobile-v3/auth/reset-password
2. **What to test**:
   - ✅ Password strength validation
   - ✅ Password confirmation matching
   - ✅ Eye icons for password visibility
   - ✅ Requirements checklist updates dynamically

---

### **🏠 Step 3: Test Mobile Dashboard**

#### **Navigate to Main Mobile App**
1. **Go to**: http://localhost:3001/mobile-v3
2. **What to test**:
   - ✅ Dashboard loads with stats
   - ✅ Bottom navigation works (tap each tab)
   - ✅ Quick actions are touch-friendly
   - ✅ Recent activity displays
   - ✅ Smooth animations throughout

---

### **🧙‍♂️ Step 4: Test Settings Wizard**

#### **Test 4a: Launch Wizard**
1. **Navigate to**: http://localhost:3001/mobile-v3/profile
2. **Tap**: "Setup Wizard" in the settings list
3. **What to test**:
   - ✅ 7-step wizard launches in fullscreen
   - ✅ Progress bar shows current step
   - ✅ Welcome screen displays properly

#### **Test 4b: Wizard Navigation**
1. **Swipe left** to go to next step (Profile)
2. **Try swiping right** to go back
3. **Use buttons** (Volgende/Vorige) as alternative
4. **What to test**:
   - ✅ Swipe gestures work smoothly
   - ✅ Button navigation works
   - ✅ Cannot proceed without required fields
   - ✅ Step transitions are smooth

#### **Test 4c: Complete Wizard**
1. **Fill in Profile step**: Enter your name and company
2. **Contact step**: Enter phone (+31 format) and email
3. **Business step**: Add opening hours (optional)
4. **Company step**: Add company info (optional)
5. **Voicemail step**: Add extra information (optional)
6. **Complete step**: Tap "Setup Voltooien"
7. **What to test**:
   - ✅ Data persists when moving between steps
   - ✅ Form validation works
   - ✅ Save process completes
   - ✅ Returns to profile page

---

### **📅 Step 5: Test Enhanced Calendar**

#### **Test 5a: Calendar Navigation**
1. **Navigate to**: http://localhost:3001/mobile-v3/calendar
2. **Or tap "Calendar" in bottom navigation**
3. **What to test**:
   - ✅ Calendar displays current month
   - ✅ Swipe left/right to change months
   - ✅ Arrow buttons work for month navigation
   - ✅ "Vandaag" button returns to current month
   - ✅ Tap dates to select them

#### **Test 5b: Create New Event**
1. **Tap**: "Nieuw" button in calendar header
2. **Fill in form**:
   - Title: "Test Meeting"
   - Description: "Testing mobile calendar"
   - Select start/end dates and times
   - Choose location, priority, color
3. **What to test**:
   - ✅ Modal opens with mobile-optimized form
   - ✅ Date/time pickers work
   - ✅ "Hele dag" toggle updates time fields
   - ✅ Form validation prevents invalid times
   - ✅ Event saves and appears on calendar

#### **Test 5c: Edit and Delete Events**
1. **Tap on a created event** (in selected date section)
2. **Tap edit icon** (pencil)
3. **Modify** event details and save
4. **Tap delete icon** (X) to remove event
5. **What to test**:
   - ✅ Edit modal pre-populates data
   - ✅ Changes save correctly
   - ✅ Delete confirmation appears
   - ✅ Event removed from calendar

---

### **⏰ Step 6: Test Time Blocking**

#### **Test 6a: Access Time Blocking**
1. **Go to**: Profile page
2. **Look for**: Time blocking or schedule settings
3. **Or navigate**: Through settings menu
4. **What to test**:
   - ✅ Time blocking interface loads
   - ✅ Days of week display with icons
   - ✅ Expand/collapse animations work

#### **Test 6b: Add Time Blocks**
1. **Tap to expand** a day (e.g., Monday)
2. **Tap "Custom"** to add manual time block
3. **Tap "Snelkeuze"** to see preset options
4. **What to test**:
   - ✅ Day expands smoothly
   - ✅ Time selectors work (30-min intervals)
   - ✅ Preset blocks show with emojis
   - ✅ Can add multiple blocks per day

#### **Test 6c: Copy and Save Functions**
1. **Add time blocks** to one day
2. **Tap copy icon** to duplicate to other days
3. **Tap "Tijdblokken Opslaan"** 
4. **What to test**:
   - ✅ Copy function works
   - ✅ Time validation prevents overlaps
   - ✅ Save process completes with feedback

---

### **🧭 Step 7: Test Cross-Integration**

#### **Test 7a: Navigation Flow**
1. **Start at**: Dashboard (mobile-v3)
2. **Complete**: Settings wizard
3. **Create**: Calendar event
4. **Set up**: Time blocking
5. **Return**: To dashboard
6. **What to test**:
   - ✅ Smooth transitions between features
   - ✅ Data persists across navigation
   - ✅ No broken links or errors
   - ✅ Bottom navigation always works

#### **Test 7b: User Flow Integration**
1. **New user scenario**: Go through complete onboarding
2. **Returning user**: Quick access to all features
3. **What to test**:
   - ✅ Wizard triggers for new/incomplete profiles
   - ✅ Features work together seamlessly
   - ✅ Mobile experience feels native
   - ✅ Performance is smooth throughout

---

### **📱 Step 8: Test Mobile-Specific Features**

#### **Test 8a: Touch Interactions**
1. **Try all gestures**:
   - Swipe in wizard
   - Swipe in calendar months
   - Tap to expand time blocking days
   - Pinch/zoom (should be disabled for UI elements)
2. **What to test**:
   - ✅ Touch targets are large enough
   - ✅ Gestures feel natural
   - ✅ No accidental activations
   - ✅ Haptic feedback (if available)

#### **Test 8b: Different Screen Sizes**
1. **In dev tools**: Try different device sizes
   - iPhone SE (small)
   - iPhone 11 (medium)
   - iPad (tablet)
2. **What to test**:
   - ✅ Layouts adapt properly
   - ✅ Text remains readable
   - ✅ No horizontal scrolling
   - ✅ Touch targets stay accessible

---

### **⚡ Step 9: Test Error Scenarios**

#### **Test 9a: Network Issues**
1. **In dev tools**: Go to Network tab
2. **Set throttling**: To "Slow 3G"
3. **Try creating** calendar events or saving wizard
4. **What to test**:
   - ✅ Loading states appear
   - ✅ Error messages are user-friendly
   - ✅ App doesn't crash
   - ✅ Retry mechanisms work

#### **Test 9b: Form Validation**
1. **Try submitting** forms with:
   - Empty required fields
   - Invalid email formats
   - Invalid phone numbers
   - End times before start times
2. **What to test**:
   - ✅ Clear validation messages
   - ✅ Fields highlight correctly
   - ✅ User knows what to fix
   - ✅ Validation in real-time

---

## 📝 **Testing Checklist**

Use this checklist to track your testing progress:

### **Authentication** 
- [ ] Mobile login form works
- [ ] Forgot password flow complete
- [ ] Reset password validation works
- [ ] Redirects work properly

### **Settings Wizard**
- [ ] Wizard launches from profile
- [ ] 7 steps navigate smoothly
- [ ] Swipe gestures work
- [ ] Data saves successfully
- [ ] Form validation works

### **Enhanced Calendar**
- [ ] Calendar loads and displays
- [ ] Month navigation works
- [ ] Event creation works
- [ ] Event editing works
- [ ] Event deletion works
- [ ] API integration works

### **Time Blocking**
- [ ] Days expand/collapse
- [ ] Custom time blocks work
- [ ] Preset blocks work
- [ ] Copy functions work
- [ ] Save process works

### **Mobile UX**
- [ ] Touch targets are large enough
- [ ] Gestures feel natural
- [ ] Animations are smooth
- [ ] No performance issues
- [ ] Works on different screen sizes

### **Integration**
- [ ] Features work together
- [ ] Navigation is seamless
- [ ] Data persists correctly
- [ ] No JavaScript errors
- [ ] Loading states work

---

## 🐛 **What to Report**

If you find any issues, please note:

1. **Which step** you were on
2. **What you expected** to happen
3. **What actually happened**
4. **Browser and device** you're using
5. **Any error messages** in console (F12 → Console tab)

---

## 🎉 **Expected Results**

By the end of testing, you should have:

1. ✅ **Completed onboarding** with the settings wizard
2. ✅ **Created calendar events** with mobile interface
3. ✅ **Set up time blocking** for availability
4. ✅ **Experienced smooth mobile navigation** throughout
5. ✅ **Confirmed all features work** on mobile devices

---

**🚀 Ready to test? Start with Step 1 and work through each section systematically!**