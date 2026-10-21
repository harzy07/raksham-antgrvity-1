"""
RAKSHAM - Synthetic Dataset Generator
Generates realistic multi-modal scam and benign payment traces matching the 5 scam families:
1. KYC / Refund
2. Digital Arrest
3. Lottery / Rewards
4. UPI Collect / Fake Refund
5. Job / Task Scam

Matches Slide 06 benchmark: N = 1,200 (600 scam / 600 benign), 5 families.
Includes multilingual (English, Hindi, Hinglish) text and multi-signal telemetry.
"""

import json
import random
import os
import re

RANDOM_SEED = 42
random.seed(RANDOM_SEED)

SCAM_FAMILIES = {
    "kyc_refund": [
        "Dear customer, your bank KYC has expired. Download the update app immediately or account will be suspended within 24 hours. Call 9876543210.",
        "URGENT: Your electricity power will be disconnected tonight at 9:30 PM due to unpaid bill of Rs 1,450. Contact our electricity officer at 9123456789.",
        "Your SBI YONO account has been blocked due to pending PAN card verification. Click link to re-activate: http://sbi-kyc-update.online",
        "Aapka bank KYC expire ho gaya hai. 24 ghante mein account band ho jayega. Turant update karein call 9811223344.",
        "Bijli vibhag notice: Aapka bill overdue hai, aaj raat connection cut ho jayega. Turant officer ko call karein aur bill verify karein.",
        "Dear user, Rs 3,500 refund is pending on your recent Paytm payment. Please verify your bank account details to claim immediate refund.",
        "Your HDFC netbanking access is restricted. Update your Aadhaar card details now to prevent permanent deactivation.",
        "Bank alert: Multiple unauthorized login attempts detected. Verify your registered mobile number and OTP immediately.",
        "Aapke credit card ke reward points expire hone wale hain. 8500 points = Rs 8500 cash transfer ke liye yahan click karein.",
        "Income Tax department notice: Tax refund of Rs 18,450 is approved. Click to confirm your beneficiary bank account number."
    ],
    "digital_arrest": [
        "This is DCP Cyber Cell Crime Branch. A DHL parcel sent to Cambodia under your Aadhaar contains 5 fake passports and 150g MDMA. You are placed under digital arrest.",
        "Official notice from CBI Headquarters: You are implicated in Money Laundering Case #492/2026. Stay on video call. Any disconnection will lead to immediate local police raid.",
        "Telecom Regulatory Authority of India: All SIM cards registered in your name will be deactivated in 2 hours due to illegal terrorist propaganda activity. Press 9 for officer.",
        "Customs Department Mumbai Airport: Consignment #IN-8891 detained. Narcotics found. Do not disconnect call. Transfer funds to RBI safe collateral account for clearance.",
        "Yeh Crime Branch Cyber Cell se Inspector Sharma hain. Aapke naam par Supreme Court arrest warrant issue hua hai. Turant video call par judiye.",
        "High Court legal summons: You have failed to appear for financial crime deposition. Transfer clearance bond of Rs 95,000 to government depository.",
        "Police notice: Your bank account is linked to illegal hawala transactions. Cooperate with investigating officers or family will be arrested.",
        "Aapke mobile number se illegal WhatsApp accounts chal rahe hain. Crime branch legal action le rahi hai. Video statement record karayein.",
        "Enforcement Directorate notice: Asset verification order. Transfer funds to RBI escrow account for verification. Full refund in 24 hours after verification.",
        "Ministry of Home Affairs alert: Urgent national security investigation. You are required to remain on Skype surveillance until clearance certificate is generated."
    ],
    "lottery": [
        "Congratulations! Your mobile number has won Rs 25,00,000 in Kaun Banega Crorepati (KBC) WhatsApp Lucky Draw 2026. Contact Rana Pratap Singh at 9876501234.",
        "Badhaai ho! Aapka Jio number lucky winner chuna gaya hai Rs 10 Lakh cash prize ke liye. Registration fee Rs 2,500 pay karein prize release ke liye.",
        "Tata Motors mega anniversary contest winner! You have won a new Tata Harrier or cash equivalent. Pay customs and GST charge Rs 14,999 to claim.",
        "Dear Customer, you won Rs 50,000 Amazon shopping voucher + iPhone 16 Pro in Diwali lucky spin. Click here to confirm delivery address.",
        "Government mega welfare lottery 2026: Your ration card/Aadhaar has won Rs 5,00,000 direct subsidy grant. Pay verification token Rs 1,100.",
        "Congratulations! Google Pay scratch card bonus winner: Rs 1,00,000 cash credit. Tap to reveal winning code and transfer fee.",
        "Aapka Airtel number 1st prize winner bana hai 1 Crore draw mein. Apne prize manager se WhatsApp par baat karein.",
        "Dream11 IPL Jackpot Winner! You have scored 1st rank. Pay withdrawal tax 5% to release winning purse to your UPI wallet.",
        "Official notice: UK Visa & Immigrations lucky green card lottery selection. Pay clearance processing fee of Rs 8,500.",
        "Flipkart Big Billion Days VIP lucky customer: You won Gold coin 10g. Pay courier insurance Rs 999 to dispatch."
    ],
    "upi_collect": [
        "I am buying your sofa on OLX. I sent a payment request of Rs 15,000 on PhonePe. Please accept the request and enter your UPI PIN to receive money.",
        "Sir, main army officer Bol raha hoon, OLX par aapka fridge pasand aaya hai. Advance Rs 8,000 bhej raha hoon, UPI QR code scan karke PIN daliye paise mil jayenge.",
        "Google Pay test transaction: To receive Rs 25,000 insurance claim into your bank, accept the collect request and enter secret PIN.",
        "Bhaiya Rs 5,000 galti se aapke phonepe pe transfer ho gaya hai. Wapis bhej dijiye ya collect request approve kar dijiye turant.",
        "Customer refund portal: We are sending your pending Amazon cashback Rs 2,400. Open PhonePe, tap Accept on request and punch PIN.",
        "OLX buyer here: Sent QR code on WhatsApp. Scan this QR code in GPay and enter your UPI PIN. The payment will credit into your account instantly.",
        "Aapke account mein salary advance Rs 30,000 credit karne ke liye UPI collect request accept karein aur PIN authenticate karein.",
        "Shopkeeper notice: Double payment received. Please accept reverse collect request of Rs 1,850 to credit back balance.",
        "Sir I am sending token money for flat rent. Please scan this payment receiver QR code and verify with UPI PIN.",
        "Government PM Kisan Samman Nidhi: Rs 6,000 credit request. Open BHIM app, accept request and enter PIN to withdraw."
    ],
    "job_task": [
        "Part-time work from home! Earn Rs 2,000 - 5,000 daily by simply subscribing to YouTube channels and giving 5-star Google Maps reviews. Contact on Telegram: @earn_daily_vip",
        "Ghar baithe paise kamayein! Daily 1-2 hours work on mobile phone. Earn Rs 30,000/month. Join our Telegram VIP earning group now: t.me/amazon_tasks",
        "Part time job opportunity: Hotel review project. First trial task earn Rs 150 instantly in UPI. Complete prepaid trading task for 30% guaranteed profit.",
        "Telegram crypto investment task: Deposit Rs 5,000 and get Rs 7,500 in 15 minutes. Regulated by SEBI & Singapore exchange. 100% genuine.",
        "Data entry & typing job: Earn Rs 500 per page. Registration free. Initial security kit deposit Rs 2,999 refundable with first payout.",
        "Movie rating task: Like Bollywood trailers on BookMyShow and earn Rs 80 per like. Payout via UPI every evening. Message @hr_radhika_recruiter",
        "Instagram follow task: Follow travel bloggers and earn Rs 50 each. Deposit Rs 10,000 in VIP pool to unlock high-yield tasks.",
        "Work from home for housewives and students: App testing project. Daily payout guaranteed. Minimum payout Rs 1,500/day.",
        "Online survey task: Complete 5 consumer surveys and earn Rs 2,500. Upgrade to gold tier by transferring Rs 4,500 collateral.",
        "E-commerce product boosting: Place simulated orders on Flipkart to boost ratings. Earn commission 20% on each prepaid deposit."
    ]
}

BENIGN_MESSAGES = [
    "Hi Maa, sending 5000 for groceries and medicines. Let me know once you receive it.",
    "Electricity bill payment of Rs 1,420 successful for consumer ID 982341. Thank you, BESCOM.",
    "Hey Rahul, here is my share of 650 for yesterday's dinner at Barbeque Nation.",
    "Swiggy order #49281 confirmed! Your food will arrive in 25 mins. Amount paid: Rs 420.",
    "Salary of Rs 85,000 credited to your HDFC bank account ending in 4102 on 30-Sep.",
    "Uber trip receipt: You paid Rs 340 for your ride to Indiranagar Metro Station.",
    "Hi Dad, paid the society maintenance of Rs 3,500 through UPI. Receipt attached on WhatsApp.",
    "Zomato delivery order placed. Paid Rs 580 via Google Pay UPI.",
    "Recharge of Rs 299 successful for Jio mobile 9845012345. Unlimited 5G valid for 28 days.",
    "Sent 2000 to Priya for the weekend road trip petrol expenses.",
    "Milk basket monthly recharge of Rs 1,500 successful. Current wallet balance Rs 1,740.",
    "Doctor consultation fee of Rs 800 paid to Dr. Mehta Clinic. Appointment at 5:30 PM.",
    "Your LIC premium of Rs 12,450 has been successfully debited via NACH mandate.",
    "BookMyShow tickets booked for 3 persons. Total paid Rs 750 at PVR Phoenix Marketcity.",
    "Amazon order placed: Ergonomic office chair. Rs 6,999 paid via UPI.",
    "Hi Rohit, sending 1200 for the cricket turf booking for Sunday match.",
    "Cult.fit 3 months gym subscription payment of Rs 8,990 successful.",
    "Aapka DTH recharge Rs 450 safal raha. Valid till 15 Nov.",
    "Payment of Rs 150 made to Ganesh Fruits and Vegetable stall via QR code.",
    "Auto rickshaw fare Rs 85 paid via PhonePe QR to driver Ramesh Kumar."
]

def generate_variation(template):
    """Adds realistic variations (amounts, phone numbers, slight typos) to templates."""
    # Replace numbers/names dynamically
    res = template
    # Replace phone numbers
    res = re.sub(r'\b9\d{9}\b', f"9{random.randint(100000000, 999999999)}", res)
    # Randomize amounts slightly
    amounts = re.findall(r'Rs\s*([0-9,]+)', res)
    for amt in amounts:
        raw_val = int(amt.replace(',', ''))
        jittered = int(raw_val * random.uniform(0.8, 1.4))
        res = res.replace(f"Rs {amt}", f"Rs {jittered:,}")
    return res

def generate_synthetic_dataset(n_total=1200, output_file="ml/data/synthetic_transactions.json"):
    """
    Generates n_total transactions (50% scam across 5 families, 50% benign).
    Includes session signals, context signals, money-graph attributes, and labels.
    """
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    n_scam = n_total // 2
    n_benign = n_total - n_scam
    per_family = n_scam // len(SCAM_FAMILIES)

    data = []

    # 1. Generate Scam Events
    txn_id = 10000
    for family, templates in SCAM_FAMILIES.items():
        for i in range(per_family):
            txn_id += 1
            tpl = random.choice(templates)
            message = generate_variation(tpl)

            # Signal correlations for coached/scam victim:
            # High probability of active call during digital_arrest, kyc_refund, upi_collect
            call_active = 1 if family in ["digital_arrest", "kyc_refund", "upi_collect"] and random.random() < 0.85 else (1 if random.random() < 0.35 else 0)
            screen_share_active = 1 if family in ["digital_arrest", "kyc_refund", "job_task"] and random.random() < 0.45 else 0
            time_on_step = random.randint(45, 300) # Coached victim spends longer on payment screen
            new_device = 1 if random.random() < 0.38 else 0
            pasted_vpa = 1 if random.random() < 0.72 else 0 # Scam victims often copy-paste VPA from chat
            geo_velocity_kmh = random.choice([0, 15, 45, 120, 850]) if random.random() < 0.3 else 0
            odd_hour = 1 if random.random() < 0.35 else 0

            # Money graph signals
            # Scam transfers are often 3x-20x the user's normal average, to a newly created VPA with 0 past txns
            amount = random.choice([8500, 15000, 24000, 48000, 95000, 120000, 250000]) if family != "lottery" else random.choice([1500, 3500, 7500, 14999])
            amount_ratio_history = round(random.uniform(2.5, 15.0), 2)
            beneficiary_age_days = random.randint(1, 14) # Fresh mule account
            past_txn_count = 0 # First time transacting with this beneficiary
            velocity_1h = random.randint(1, 5)
            fan_out_ratio = round(random.uniform(0.6, 0.95), 2) # Mule fans out quickly

            data.append({
                "txn_id": f"TXN_{txn_id}",
                "user_id": f"USR_{random.randint(100, 999)}",
                "beneficiary_vpa": f"mule_{random.randint(1000, 9999)}@okaxis",
                "beneficiary_name": f"Merchant Account {random.randint(10, 99)}",
                "amount": amount,
                "message": message,
                "family": family,
                "is_scam": 1,
                # Session features
                "call_active": call_active,
                "screen_share_active": screen_share_active,
                "time_on_step": time_on_step,
                # Context features
                "new_device": new_device,
                "pasted_vpa": pasted_vpa,
                "geo_velocity_kmh": geo_velocity_kmh,
                "odd_hour": odd_hour,
                # Money graph features
                "amount_ratio_history": amount_ratio_history,
                "beneficiary_age_days": beneficiary_age_days,
                "past_txn_count": past_txn_count,
                "velocity_1h": velocity_1h,
                "fan_out_ratio": fan_out_ratio
            })

    # 2. Generate Benign Events
    for i in range(n_benign):
        txn_id += 1
        tpl = random.choice(BENIGN_MESSAGES)
        message = generate_variation(tpl)

        # Benign user attributes
        call_active = 1 if random.random() < 0.08 else 0 # Rare for normal payment to be during active call
        screen_share_active = 0 # Almost never screen sharing
        time_on_step = random.randint(5, 30) # Fast checkout
        new_device = 1 if random.random() < 0.05 else 0
        pasted_vpa = 1 if random.random() < 0.15 else 0
        geo_velocity_kmh = 0
        odd_hour = 1 if random.random() < 0.08 else 0

        # Money graph
        amount = random.choice([150, 420, 650, 1200, 2500, 5000, 8500])
        amount_ratio_history = round(random.uniform(0.4, 1.8), 2)
        beneficiary_age_days = random.randint(60, 1200) # Established friend/merchant
        past_txn_count = random.randint(3, 45) # Repeated payee (trusted payee suppression)
        velocity_1h = 1
        fan_out_ratio = round(random.uniform(0.05, 0.25), 2)

        data.append({
            "txn_id": f"TXN_{txn_id}",
            "user_id": f"USR_{random.randint(100, 999)}",
            "beneficiary_vpa": random.choice(["son_rahul@okhdfc", "swiggy@icici", "bescom_power@sbi", "grocery_mart@paytm", "priya_friend@axis"]),
            "beneficiary_name": random.choice(["Rahul Verma", "Swiggy UPI", "BESCOM Billing", "Ganesh Supermarket", "Priya Sen"]),
            "amount": amount,
            "message": message,
            "family": "benign",
            "is_scam": 0,
            # Session features
            "call_active": call_active,
            "screen_share_active": screen_share_active,
            "time_on_step": time_on_step,
            # Context features
            "new_device": new_device,
            "pasted_vpa": pasted_vpa,
            "geo_velocity_kmh": geo_velocity_kmh,
            "odd_hour": odd_hour,
            # Money graph features
            "amount_ratio_history": amount_ratio_history,
            "beneficiary_age_days": beneficiary_age_days,
            "past_txn_count": past_txn_count,
            "velocity_1h": velocity_1h,
            "fan_out_ratio": fan_out_ratio
        })

    random.shuffle(data)

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"Generated {len(data)} synthetic transactions saved to {output_file}")
    return data

if __name__ == "__main__":
    generate_synthetic_dataset()
