# NyxCodex Stripe & Vercel Setup Guide

Complete this setup before you accept your first payment.
Estimated time: 20-30 minutes.

---

## Prerequisites

- Stripe account (free at stripe.com)
- Vercel account with NyxCodex deployed
- Firebase service account JSON (from Firebase Console)

---

## Step 1: Create Stripe Products

1. Log in to [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Go to **Products** → **Add product**
3. Create these three products:

### Product 1 — Foundations
- **Name:** NyxCodex — Foundations
- **Description:** Clinical de-escalation training for up to 25 staff members
- **Price:** $199.00 / month (recurring)
- **Billing:** Monthly
- Copy the **Price ID** (starts with `price_...`) — you'll need it

### Product 2 — Professional
- **Name:** NyxCodex — Professional
- **Description:** Clinical de-escalation training for up to 100 staff members
- **Price:** $499.00 / month (recurring)
- **Billing:** Monthly
- Copy the **Price ID**

### Product 3 — Enterprise
- **Name:** NyxCodex — Enterprise
- **Description:** Clinical de-escalation training, unlimited staff
- **Price:** $999.00 / month (recurring)
- **Billing:** Monthly
- Copy the **Price ID**

---

## Step 2: Get Your Stripe Secret Key

1. In Stripe Dashboard → **Developers** → **API keys**
2. Copy your **Secret key** (starts with `sk_live_...`)
   > Use `sk_test_...` first to test, then switch to live when ready

---

## Step 3: Set Up the Stripe Webhook

1. In Stripe Dashboard → **Developers** → **Webhooks** → **Add endpoint**
2. **Endpoint URL:** `https://YOUR-VERCEL-URL.vercel.app/api/stripe-webhook`
   (Replace with your actual Vercel deployment URL)
3. **Listen to:** Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Click **Add endpoint**
5. Copy the **Signing secret** (starts with `whsec_...`)

---

## Step 4: Get Firebase Service Account

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (dsh-training-lab)
3. Click the gear icon → **Project settings** → **Service accounts**
4. Click **Generate new private key** → **Generate key**
5. A JSON file downloads — DO NOT commit this file to Git
6. Convert it to base64:
   - **Mac/Linux:** `base64 -i serviceAccount.json | tr -d '\n'`
   - **Windows PowerShell:** 
     ```powershell
     [Convert]::ToBase64String([System.IO.File]::ReadAllBytes("serviceAccount.json"))
     ```
7. Copy the resulting base64 string

---

## Step 5: Configure Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com) → your NyxCodex project
2. Click **Settings** → **Environment Variables**
3. Add each of these (set scope to **Production**):

| Variable Name | Value |
|--------------|-------|
| `STRIPE_SECRET_KEY` | `sk_live_...` (from Step 2) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (from Step 3) |
| `STRIPE_PRICE_SMALL` | `price_...` (Foundations Price ID) |
| `STRIPE_PRICE_MEDIUM` | `price_...` (Professional Price ID) |
| `STRIPE_PRICE_ENTERPRISE` | `price_...` (Enterprise Price ID) |
| `FIREBASE_SERVICE_ACCOUNT` | base64 string from Step 4 |
| `FIREBASE_DATABASE_URL` | `https://dsh-training-lab-default-rtdb.firebaseio.com` |
| `BASE_URL` | `https://YOUR-VERCEL-URL.vercel.app` |

4. Click **Save** for each one
5. Redeploy Vercel: **Deployments** → latest → **Redeploy**

---

## Step 6: Activate Your Own Organization

Your organization (Destiny Springs) is hard-coded as always active — you'll never
hit the paywall. No Firebase record needed.

To manually activate any test organization for free access:
1. Go to Firebase Console → Realtime Database
2. Navigate to `orgs/{orgId}/subscription`
3. Add this data:
   ```json
   {
     "status": "active",
     "plan": "enterprise",
     "seatsMax": -1,
     "orgName": "Test Org",
     "activatedAt": 1720000000
   }
   ```

---

## Step 7: Test the Payment Flow

1. Use Stripe test mode (`sk_test_...`) during testing
2. Go to your site → **Pricing** section → click a plan
3. Use Stripe test card: `4242 4242 4242 4242` / any future date / any CVC
4. After checkout completes, verify Firebase has the subscription record
5. Try logging in with the org's email — they should get through the paywall

**Test card for payment failures:** `4000 0000 0000 0002`

---

## Step 8: Go Live

1. Switch `STRIPE_SECRET_KEY` from `sk_test_...` to `sk_live_...`
2. Update your webhook endpoint in Stripe to use your production URL
3. Copy the new `whsec_...` signing secret and update `STRIPE_WEBHOOK_SECRET`
4. Redeploy Vercel

---

## Troubleshooting

**Webhook not firing:**
- Check the Stripe Dashboard → Webhooks → your endpoint → event logs
- Ensure your Vercel URL is correct and reachable
- Check Vercel logs: `vercel logs` or Vercel Dashboard → Functions

**Subscription not activating after payment:**
- Check Vercel function logs for errors
- Verify `FIREBASE_SERVICE_ACCOUNT` is correct base64 (no line breaks)
- Verify `FIREBASE_DATABASE_URL` ends with `.firebaseio.com` (no trailing slash)

**User still hitting paywall after payment:**
- Check Firebase Console → `orgs/{orgId}/subscription` exists
- Verify `status === "active"` and `currentPeriodEnd` is in the future

---

## Support

Questions: info@nyxcollectivellc.com
