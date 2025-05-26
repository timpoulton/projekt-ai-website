# How to Create Client Proposals with AI

## 🎯 Process Overview

Just like your portfolio system, you work directly with AI in Cursor to create client proposals. No web generators needed - just tell AI about your client and it creates a professional proposal page.

## 📋 Step-by-Step Process

### 1. **Tell AI About Your Client**
In Cursor, describe the client request like this:

```
I need to create a client proposal for [CLIENT_NAME]. Here are the details:

- **Client:** [CLIENT_NAME]
- **Industry:** [e.g., Marketing Agency, Nightlife, etc.]
- **Current Process:** [What they're doing manually now]
- **Desired Outcome:** [What they want to achieve]
- **Tools They Use:** [Current tools/systems]
- **Timeline:** [When they need it done]

Please create a professional proposal page using the client-proposal-template.html
```

### 2. **AI Creates the Proposal**
AI will:
- Copy the template from `templates/client-proposal-template.html`
- Replace all the `[PLACEHOLDER]` values with client-specific content
- Create a new file like `together-agency-proposal.html`
- Generate appropriate workflow steps, metrics, and pricing

### 3. **Review and Send**
- Check the generated proposal
- Make any adjustments needed
- Send the HTML file to your client or host it on your website

## 🔧 Template Placeholders

The template includes these placeholders that AI will replace:

### **Basic Info**
- `[CLIENT_NAME]` - Client company name
- `[INDUSTRY_ICON]` - Font Awesome icon (e.g., fas fa-bullhorn)
- `[INDUSTRY_TYPE]` - Industry description (e.g., "Marketing Agency Automation")

### **Project Details**
- `[CURRENT_PROCESS]` - What they're doing manually
- `[DESIRED_OUTCOME]` - What they want to achieve
- `[TOOLS_USED]` - Current tools and systems

### **Metrics**
- `[TIME_SAVED]` - Percentage time saved (e.g., 85)
- `[ACCURACY]` - Accuracy percentage (e.g., 99)
- `[EFFICIENCY]` - Efficiency gain percentage (e.g., 400)
- `[TIMELINE]` - Delivery timeline (e.g., "3-4")

### **Workflow Steps**
- `[STEP_1_TITLE]` through `[STEP_5_TITLE]` - Step names
- `[STEP_1_DESCRIPTION]` through `[STEP_5_DESCRIPTION]` - Step descriptions

### **Pricing**
- `[PRICE_RANGE]` - Price estimate (e.g., "$1,500-$3,000")
- `[DELIVERY_WEEKS]` - Delivery time (e.g., "3-4")

## 📝 Example Request

Here's how you'd ask AI to create the Together Agency proposal:

```
I need to create a client proposal for Together Agency. Here are the details:

- **Client:** Together Agency
- **Industry:** Marketing Agency
- **Current Process:** Currently manually creating Tally form links for each client booking. After clients make deposits, they need to send personalized form links with pre-filled customer data. This involves copying client information from booking emails and manually creating custom URLs for each Tally form.
- **Desired Outcome:** Automate the entire process of extracting client data from booking emails and generating pre-populated Tally form links. Want to eliminate manual data entry and ensure consistent, professional follow-up with clients immediately after they make deposits.
- **Tools They Use:** Tally.so, Email, Manual processes
- **Timeline:** Standard (3-4 weeks)

Please create a professional proposal page using the client-proposal-template.html and save it as together-agency-proposal.html
```

## 🎨 Styling

The template uses your existing website styling:
- Dark theme with accent gradient
- Professional layout
- Mobile responsive
- Matches your brand perfectly

## 📁 File Organization

- **Template:** `templates/client-proposal-template.html`
- **Generated Proposals:** Save as `[client-name]-proposal.html` in the root
- **Example:** `together-agency-proposal.html`

## 🚀 Benefits

- **Fast:** Generate proposals in minutes, not hours
- **Professional:** Consistent, branded appearance
- **Customized:** Each proposal tailored to specific client needs
- **No Coding:** Just describe the client to AI
- **Reusable:** Same process for every client

---

**This follows the exact same pattern as your portfolio system - work with AI in Cursor to generate content, no web-based generators needed!** 