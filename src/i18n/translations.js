// Translation Dictionary for English (EN), Telugu (TE), and Hindi (HI)

export const translations = {
  EN: {
    // Navigation
    brandTitle: "KrishiDwaar System",
    portalFarmer: "Farmer Portal",
    portalMandi: "Mandi Officer Portal",
    portalAdmin: "Admin Portal",
    navHome: "Home Dashboard",
    navRecentBookings: "Recent Slot Bookings",
    navBookSlot: "Book Slot",
    navBills: "Bills & Transactions",
    navProfile: "My Profile",
    navLogout: "Logout",
    selectLanguage: "Language",

    // Farmer Login / Register
    farmerLoginTitle: "Farmer Login",
    farmerRegisterTitle: "New Farmer Registration",
    farmerIdLabel: "8-Digit Farmer ID",
    farmerIdPlaceholder: "Enter 8-digit Farmer ID (e.g. 10029384)",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter Password",
    farmerNameLabel: "Farmer Full Name",
    mobileLabel: "Mobile Number",
    locationLabel: "Village / Location",
    bankDetailsLabel: "Bank Details (Prototype)",
    loginBtn: "Login to Farmer Portal",
    registerBtn: "Register Account",
    noAccount: "Don't have a Farmer ID?",
    hasAccount: "Already registered?",
    demoFarmerNotice: "Demo Farmer ID: 10029384 | Password: password123",

    // Farmer Dashboard
    welcomeFarmer: "Welcome,",
    dashboardSubHeading: "Manage your crop procurement slots, QR tickets, and view transaction bills.",
    quickBookBtn: "+ Book Procurement Slot",
    recentBookingsTitle: "Recent Slot Bookings",
    noBookings: "No slot bookings found. Book your first procurement slot above!",
    billNotificationAlert: "New Bill Available! Your procurement payment has been processed.",

    // Booking Wizard Steps
    step1Title: "1. Select Crop",
    step1Desc: "Choose the crop you want to bring for procurement",
    step2Title: "2. Select Mandi",
    step2Desc: "Choose an available procurement mandi accepting your crop",
    step3Title: "3. Select Date",
    step3Desc: "Choose a procurement date (1-Month Calendar View)",
    step4Title: "4. Select Time Slot",
    step4Desc: "Select an available 30-minute arrival time slot",
    step5Title: "5. Expected Quantity",
    step5Desc: "Enter expected quantity (Optional estimate)",
    step6Title: "6. Confirm Booking",

    cropSelectPrompt: "Select Crop:",
    mandiSelectPrompt: "Select Compatible Mandi:",
    noMandisForCrop: "No mandis currently available for the selected crop.",
    calendarLegendGreen: "Green: High Availability",
    calendarLegendYellow: "Yellow: Limited Slots",
    calendarLegendRed: "Red: Full / Unavailable",

    expectedQtyLabel: "Expected Quantity (in Quintals / 100 kg)",
    expectedQtyPlaceholder: "e.g. 50 (Leave blank if unsure)",
    expectedQtyHint: "Note: The Mandi Officer will weigh the actual quantity using the weighing scale at the mandi.",

    confirmSummaryTitle: "Booking Summary Review",
    selectedCropLabel: "Selected Crop:",
    selectedMandiLabel: "Selected Mandi:",
    selectedDateLabel: "Date:",
    selectedSlotLabel: "Time Slot:",
    expectedQtyVal: "Expected Quantity:",
    notSpecified: "Not specified (To be weighed at Mandi)",
    confirmBookingBtn: "Confirm Slot Booking",
    bookingSuccessTitle: "Slot Booked Successfully!",
    tokenGeneratedMsg: "Your unique Token Number and QR Code have been generated.",
    returnDashboardBtn: "Return to Dashboard",

    // Booking Details & QR Cards
    cardDetailsTitle: "Booking Details",
    cardQrTitle: "QR Code & Token Pass",
    tokenNumberLabel: "Token Number:",
    arrivalStatusLabel: "Arrival Status:",
    procurementStatusLabel: "Procurement Status:",
    paymentStatusLabel: "Payment Status:",
    downloadQrBtn: "Download Ticket Pass",

    // Status Texts
    statusPending: "Pending Arrival",
    statusVerified: "Verified / Arrived",
    statusCompleted: "Completed",

    // Bills & History Page
    billsTitle: "Transactions & Bills History",
    billsSubHeading: "View, print, or download your official procurement bills.",
    noBills: "No procurement bills generated yet.",
    billNo: "Bill No:",
    paymentRef: "Ref Txn ID:",
    procuredCrop: "Procured Crop:",
    actualQtyPaid: "Actual Quantity Weighed:",
    ratePerQuintal: "Procurement Rate:",
    totalAmountPaid: "Total Amount Transacted:",
    billedByStaff: "Billed By Officer:",
    viewBillBtn: "View Bill Receipt",
    downloadBillImgBtn: "Download Bill Image",
    printBillBtn: "Print Bill",

    // Profile Page
    profileTitle: "Farmer Profile",
    farmerId: "Farmer ID:",
    mobile: "Mobile Number:",
    location: "Location:",
    bankAccount: "Bank Account Details (Prototype Representation):",
    bankNotice: "Note: Banking details are used for prototype transaction representation only.",

    // Common
    backBtn: "Back",
    nextBtn: "Next Step",
    closeBtn: "Close"
  },

  TE: {
    // Navigation
    brandTitle: "కృషిద్వార్ సిస్టమ్",
    portalFarmer: "రైతు పోర్టల్",
    portalMandi: "మండి అధికారి పోర్టల్",
    portalAdmin: "అడ్మిన్ పోర్టల్",
    navHome: "హోమ్ డాష్‌బోర్డ్",
    navRecentBookings: "ఇటీవలి స్లాట్ బుకింగ్‌లు",
    navBookSlot: "స్లాట్ బుక్ చేయండి",
    navBills: "బిల్‌లు & లావాదేవీలు",
    navProfile: "నా ప్రొఫైల్",
    navLogout: "లాగౌట్",
    selectLanguage: "భాష",

    // Farmer Login / Register
    farmerLoginTitle: "రైతు లాగిన్",
    farmerRegisterTitle: "కొత్త రైతు నమోదు",
    farmerIdLabel: "8-అంకెల రైతు ID",
    farmerIdPlaceholder: "8-అంకెల రైతు ID నమోదు చేయండి (ఉదా: 10029384)",
    passwordLabel: "పాస్‌వర్డ్",
    passwordPlaceholder: "పాస్‌వర్డ్ నమోదు చేయండి",
    farmerNameLabel: "రైతు పూర్తి పేరు",
    mobileLabel: "మొబైల్ సంఖ్య",
    locationLabel: "గ్రామం / ప్రాంతం",
    bankDetailsLabel: "బ్యాంకు వివరాలు (నమూనా)",
    loginBtn: "రైతు పోర్టల్‌లోకి లాగిన్ అవ్వండి",
    registerBtn: "ఖాతాను నమోదు చేయండి",
    noAccount: "రైతు ID లేదా?",
    hasAccount: "ఇప్పటికే నమోదయ్యారా?",
    demoFarmerNotice: "డెమో రైతు ID: 10029384 | పాస్‌వర్డ్: password123",

    // Farmer Dashboard
    welcomeFarmer: "స్వాగతం,",
    dashboardSubHeading: "మీ పంట సేకరణ స్లాట్‌లు, QR టిక్కెట్‌లను నిర్వహించండి మరియు రసీదు బిల్‌లను చూడండి.",
    quickBookBtn: "+ సేకరణ స్లాట్ బుక్ చేయండి",
    recentBookingsTitle: "ఇటీవలి స్లాట్ బుకింగ్‌లు",
    noBookings: "స్లాట్ బుకింగ్‌లు లేవు. పైన ఉన్న బటన్ ద్వారా మీ మొదటి స్లాట్‌ను బుక్ చేయండి!",
    billNotificationAlert: "కొత్త బిల్ అందుబాటులో ఉంది! మీ పంట సేకరణ చెల్లింపు పూర్తయింది.",

    // Booking Wizard Steps
    step1Title: "1. పంటను ఎంచుకోండి",
    step1Desc: "మీరు తీసుకురావాలనుకుంటున్న పంటను ఎంచుకోండి",
    step2Title: "2. మండిని ఎంచుకోండి",
    step2Desc: "మీ పంటను స్వీకరించే మండిని ఎంచుకోండి",
    step3Title: "3. తేదీని ఎంచుకోండి",
    step3Desc: "సేకరణ తేదీని ఎంచుకోండి (1-నెల క్యాలెండర్)",
    step4Title: "4. సమయ స్లాట్‌ను ఎంచుకోండి",
    step4Desc: "అందుబాటులో ఉన్న 30 నిమిషాల స్లాట్‌ను ఎంచుకోండి",
    step5Title: "5. అంచనా వేసిన పరిమాణం",
    step5Desc: "అంచనా వేసిన పరిమాణాన్ని నమోదు చేయండి (ఐచ్ఛికం)",
    step6Title: "6. బుకింగ్ ధృవీకరించండి",

    cropSelectPrompt: "పంటను ఎంచుకోండి:",
    mandiSelectPrompt: "సరిపోయే మండిని ఎంచుకోండి:",
    noMandisForCrop: "ఎంచుకున్న పంటకు ప్రస్తుతం మండీలు అందుబాటులో లేవు.",
    calendarLegendGreen: "ఆకుపచ్చ: ఎక్కువ స్లాట్‌లు అందుబాటులో ఉన్నాయి",
    calendarLegendYellow: "పసుపు: పరిమిత స్లాట్‌లు",
    calendarLegendRed: "ఎరుపు: స్లాట్‌లు పూర్తి అయ్యాయి",

    expectedQtyLabel: "అంచనా వేసిన పరిమాణం (క్వింటాళ్లలో / 100 కేజీలు)",
    expectedQtyPlaceholder: "ఉదా: 50 (తెలియకపోతే ఖాళీగా వదిలేయండి)",
    expectedQtyHint: "గమనిక: మండి అధికారి కాటా యంత్రం ద్వారా అసలు బరువును కొలుస్తారు.",

    confirmSummaryTitle: "బుకింగ్ వివరాల పరిశీలన",
    selectedCropLabel: "ఎంచుకున్న పంట:",
    selectedMandiLabel: "ఎంచుకున్న మండి:",
    selectedDateLabel: "తేదీ:",
    selectedSlotLabel: "సమయ స్లాట్:",
    expectedQtyVal: "అంచనా పరిమాణం:",
    notSpecified: "పేర్కొనబడలేదు (మండి వద్ద కొలవబడుతుంది)",
    confirmBookingBtn: "స్లాట్ బుకింగ్‌ను ధృవీకరించండి",
    bookingSuccessTitle: "స్లాట్ విజయవంతంగా బుక్ చేయబడింది!",
    tokenGeneratedMsg: "మీ ప్రత్యేక టోకెన్ నంబర్ మరియు QR కోడ్ సృష్టించబడ్డాయి.",
    returnDashboardBtn: "డాష్‌బోర్డ్‌కు తిరిగి వెళ్లండి",

    // Booking Details & QR Cards
    cardDetailsTitle: "బుకింగ్ వివరాలు",
    cardQrTitle: "QR కోడ్ & టోకెన్ పాస్",
    tokenNumberLabel: "టోకెన్ నంబర్:",
    arrivalStatusLabel: "రాక స్థితి:",
    procurementStatusLabel: "సేకరణ స్థితి:",
    paymentStatusLabel: "చెల్లింపు స్థితి:",
    downloadQrBtn: "టికెట్ పాస్ డౌన్‌లోడ్ చేయండి",

    // Status Texts
    statusPending: "రాక కోసం వేచి ఉంది",
    statusVerified: "ధృవీకరించబడింది / వచ్చారు",
    statusCompleted: "పూర్తయింది",

    // Bills & History Page
    billsTitle: "లావాదేవీలు & బిల్‌ల చరిత్ర",
    billsSubHeading: "మీ అధికారిక పంట సేకరణ బిల్‌లను చూడండి, ప్రింట్ చేయండి లేదా డౌన్‌లోడ్ చేయండి.",
    noBills: "ఇంకా ఎటువంటి బిల్‌లు సృష్టించబడలేదు.",
    billNo: "బిల్ నంబర్:",
    paymentRef: "చెల్లింపు ID:",
    procuredCrop: "సేకరించిన పంట:",
    actualQtyPaid: "కొలిచిన అసలు పరిమాణం:",
    ratePerQuintal: "క్వింటాల్ ధర:",
    totalAmountPaid: "చెల్లించిన మొత్తం:",
    billedByStaff: "బిల్ చేసిన అధికారి:",
    viewBillBtn: "రసీదు బిల్ చూడండి",
    downloadBillImgBtn: "బిల్ చిత్రాన్ని డౌన్‌లోడ్ చేయండి",
    printBillBtn: "ప్రింట్ బిల్",

    // Profile Page
    profileTitle: "రైతు ప్రొఫైల్",
    farmerId: "రైతు ID:",
    mobile: "మొబైల్ సంఖ్య:",
    location: "ప్రాంతం:",
    bankAccount: "బ్యాంకు ఖాతా వివరాలు (నమూనా):",
    bankNotice: "గమనిక: బ్యాంకు వివరాలు నమూనా లావాదేవీల కోసం మాత్రమే చూపబడుతున్నాయి.",

    // Common
    backBtn: "వెనుకకు",
    nextBtn: "తరువాతి మెట్టు",
    closeBtn: "మూసివేయండి"
  },

  HI: {
    // Navigation
    brandTitle: "कृषिद्वार सिस्टम",
    portalFarmer: "किसान पोर्टल",
    portalMandi: "मंडी अधिकारी पोर्टल",
    portalAdmin: "एडमिन पोर्टल",
    navHome: "होम डैशबोर्ड",
    navRecentBookings: "हाल की स्लॉट बुकिंग",
    navBookSlot: "स्लॉट बुक करें",
    navBills: "बिल एवं लेनदेन",
    navProfile: "मेरी प्रोफाइल",
    navLogout: "लॉगआउट",
    selectLanguage: "भाषा",

    // Farmer Login / Register
    farmerLoginTitle: "किसान लॉगिन",
    farmerRegisterTitle: "नया किसान पंजीकरण",
    farmerIdLabel: "8-अंकों की किसान आईडी",
    farmerIdPlaceholder: "8-अंकों की किसान आईडी दर्ज करें (जैसे 10029384)",
    passwordLabel: "पासवर्ड",
    passwordPlaceholder: "पासवर्ड दर्ज करें",
    farmerNameLabel: "किसान का पूरा नाम",
    mobileLabel: "मोबाइल नंबर",
    locationLabel: "गांव / स्थान",
    bankDetailsLabel: "बैंक विवरण (प्रारूप)",
    loginBtn: "किसान पोर्टल में लॉगिन करें",
    registerBtn: "खाता पंजीकृत करें",
    noAccount: "किसान आईडी नहीं है?",
    hasAccount: "पहले से पंजीकृत हैं?",
    demoFarmerNotice: "डेमो किसान आईडी: 10029384 | पासवर्ड: password123",

    // Farmer Dashboard
    welcomeFarmer: "स्वागत है,",
    dashboardSubHeading: "अपने फसल खरीद स्लॉट, क्यूआर टिकट प्रबंधित करें और रसीद बिल देखें।",
    quickBookBtn: "+ खरीद स्लॉट बुक करें",
    recentBookingsTitle: "हाल की स्लॉट बुकिंग",
    noBookings: "कोई स्लॉट बुकिंग नहीं मिली। ऊपर बटन से अपना पहला स्लॉट बुक करें!",
    billNotificationAlert: "नया बिल उपलब्ध है! आपकी फसल खरीद का भुगतान हो चुका है।",

    // Booking Wizard Steps
    step1Title: "1. फसल चुनें",
    step1Desc: "वह फसल चुनें जिसे आप खरीद के लिए लाना चाहते हैं",
    step2Title: "2. मंडी चुनें",
    step2Desc: "अपनी फसल स्वीकार करने वाली उपलब्ध मंडी चुनें",
    step3Title: "3. तिथि चुनें",
    step3Desc: "खरीद की तिथि चुनें (1-महीने का कैलेंडर दृष्टिकोण)",
    step4Title: "4. समय स्लॉट चुनें",
    step4Desc: "उपलब्ध 30 मिनट का आगमन समय स्लॉट चुनें",
    step5Title: "5. अपेक्षित मात्रा",
    step5Desc: "अपेक्षित मात्रा दर्ज करें (वैकल्पिक अनुमान)",
    step6Title: "6. बुकिंग की पुष्टि करें",

    cropSelectPrompt: "फसल चुनें:",
    mandiSelectPrompt: "उपयुक्त मंडी चुनें:",
    noMandisForCrop: "चुनी गई फसल के लिए वर्तमान में कोई मंडी उपलब्ध नहीं है।",
    calendarLegendGreen: "हरा: उच्च उपलब्धता",
    calendarLegendYellow: "पीला: सीमित स्लॉट",
    calendarLegendRed: "लाल: स्लॉट पूर्ण / अनुपलब्ध",

    expectedQtyLabel: "अपेक्षित मात्रा (क्विंटल में / 100 किग्रा)",
    expectedQtyPlaceholder: "जैसे 50 (यदि अनिश्चित हों तो खाली छोड़ दें)",
    expectedQtyHint: "नोट: मंडी अधिकारी वजन कांटे पर वास्तविक वजन की जांच करेंगे।",

    confirmSummaryTitle: "बुकिंग विवरण समीक्षा",
    selectedCropLabel: "चुनी गई फसल:",
    selectedMandiLabel: "चुनी गई मंडी:",
    selectedDateLabel: "तिथि:",
    selectedSlotLabel: "समय स्लॉट:",
    expectedQtyVal: "अपेक्षित मात्रा:",
    notSpecified: "निर्दिष्ट नहीं (मंडी में वजन किया जाएगा)",
    confirmBookingBtn: "स्लॉट बुकिंग की पुष्टि करें",
    bookingSuccessTitle: "स्लॉट सफलतापूर्वक बुक हो गया!",
    tokenGeneratedMsg: "आपका अनूठा टोकन नंबर और क्यूआर कोड उत्पन्न हो गया है।",
    returnDashboardBtn: "डैशबोर्ड पर लौटें",

    // Booking Details & QR Cards
    cardDetailsTitle: "बुकिंग विवरण",
    cardQrTitle: "क्यूआर कोड एवं टोकन पास",
    tokenNumberLabel: "टोकन नंबर:",
    arrivalStatusLabel: "आगमन स्थिति:",
    procurementStatusLabel: "खरीद स्थिति:",
    paymentStatusLabel: "भुगतान स्थिति:",
    downloadQrBtn: "टिकट पास डाउनलोड करें",

    // Status Texts
    statusPending: "आगमन का इंतजार",
    statusVerified: "सत्यापित / पहुंचे",
    statusCompleted: "पूर्ण",

    // Bills & History Page
    billsTitle: "लेनदेन एवं बिल इतिहास",
    billsSubHeading: "अपने आधिकारिक फसल खरीद बिल देखें, प्रिंट करें या डाउनलोड करें।",
    noBills: "अभी तक कोई खरीद बिल उत्पन्न नहीं हुआ है।",
    billNo: "बिल नंबर:",
    paymentRef: "भुगतान आईडी:",
    procuredCrop: "खरीदी गई फसल:",
    actualQtyPaid: "वास्तविक वजन किया गया:",
    ratePerQuintal: "खरीद दर (प्रति क्विंटल):",
    totalAmountPaid: "कुल भुगतान राशि:",
    billedByStaff: "बिलकर्ता अधिकारी:",
    viewBillBtn: "रसीद बिल देखें",
    downloadBillImgBtn: "बिल छवि डाउनलोड करें",
    printBillBtn: "प्रिंट बिल",

    // Profile Page
    profileTitle: "किसान प्रोफाइल",
    farmerId: "किसान आईडी:",
    mobile: "मोबाइल नंबर:",
    location: "स्थान:",
    bankAccount: "बैंक खाता विवरण (प्रारूप):",
    bankNotice: "नोट: बैंक विवरण केवल प्रारूप प्रदर्शन के लिए उपयोग किए जाते हैं।",

    // Common
    backBtn: "वापस",
    nextBtn: "अगला चरण",
    closeBtn: "बंद करें"
  }
};
