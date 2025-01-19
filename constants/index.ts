export const constantUserData = ["bio"];

export const profileTabs = [
  {
    title: "Meet Me",
    content: ["firstname", "lastname", "gender", "dateOfBirth", "bio"],
  },
  {
    title: "My Interest",
    content: "otherDetails",
    icons: [
      { field: "What is your marital status?", icon: "people-outline" },
      { field: "Do you have children already?", icon: "heart-outline" },
      {
        field: "How many children would you like to have?",
        icon: "people-circle-outline",
      },
      {
        field: "What type of parenting arrangement do you prefer?",
        icon: "home-outline",
      },
      {
        field: "What parenting style do you follow or believe in?",
        icon: "construct-outline",
      },
      {
        field: "What values would you prioritize in raising children?",
        icon: "bulb-outline",
      },
      {
        field: "Are you open to co-parenting with multiple partners?",
        icon: "people-outline",
      },
      {
        field: "How do you feel about vaccinations for children?",
        icon: "medkit-outline",
      },
      {
        field: "What type of schooling do you prefer for children?",
        icon: "school-outline",
      },
      {
        field:
          "Is your family supportive and will they be involved in the co-parenting journey?",
        icon: "family-outline",
      },
      {
        field: "What is your highest level of education?",
        icon: "book-outline",
      },
      {
        field: "What is your primary language?",
        icon: "chatbox-ellipses-outline",
      },
      { field: "What other languages do you speak?", icon: "language-outline" },
      { field: "Where do you currently live?", icon: "location-outline" },
      {
        field: "How long have you lived in your current location?",
        icon: "time-outline",
      },
      {
        field: "Are you open to relocating for co-parenting?",
        icon: "map-outline",
      },
      { field: "Do you have pets?", icon: "paw-outline" },
      {
        field: "Do you follow a specific diet or lifestyle?",
        icon: "restaurant-outline",
      },
      {
        field: "What is your current employment status?",
        icon: "briefcase-outline",
      },
      {
        field:
          "How many years of experience do you have in your current job or career field?",
        icon: "stats-chart-outline",
      },
      {
        field:
          "How long have you been working at your current employer or business?",
        icon: "hourglass-outline",
      },
      { field: "What is your job title or career?", icon: "person-outline" },
      { field: "What is your approximate income range?", icon: "cash-outline" },
      {
        field: "What is your preferred financial arrangement for co-parenting?",
        icon: "wallet-outline",
      },
      {
        field: "What are your physical activity habits?",
        icon: "bicycle-outline",
      },
      { field: "Do you smoke?", icon: "cloud-outline" },
      { field: "Do you drink alcohol?", icon: "wine-outline" },
      {
        field:
          "Do you have any health concerns or conditions you would like to disclose?",
        icon: "heart-half-outline",
      },
      {
        field: "What is your political affiliation or worldview?",
        icon: "globe-outline",
      },
      {
        field: "Do you want your co-parent to share similar political beliefs?",
        icon: "scale-outline",
      },
      {
        field: "Are you open to a romantic relationship with your co-parent?",
        icon: "heart-outline",
      },
      {
        field: "How often do you want to communicate with your co-parent?",
        icon: "chatbubble-outline",
      },
      {
        field: "What is your ideal relationship dynamic with your co-parent?",
        icon: "handshake-outline",
      },
      {
        field: "What is your biggest motivation for joining Parenti?",
        icon: "rocket-outline",
      },
      {
        field: "What qualities do you value most in a co-parent?",
        icon: "medal-outline",
      },
      {
        field:
          "Do you believe in shared decision-making when it comes to important parenting choices?",
        icon: "sync-outline",
      },
      {
        field: "What are your thoughts on religion in raising children?",
        icon: "book-outline",
      },
      {
        field:
          "What role do you think extended family should play in raising children?",
        icon: "people-outline",
      },
      { field: "Where have you traveled to?", icon: "airplane-outline" },
      {
        field:
          "What other cultural or life experiences do you feel are important in raising children?",
        icon: "earth-outline",
      },
    ],
  },
];

export const genders = [
  { id: 1, optionText: "Male" },
  { id: 2, optionText: "Female" },
  { id: 3, optionText: "Others" },
];

export const profileRegistrationFields = [
  {
    id: 1,
    label: "What type of account are you creating?",
    field: "publicFigure",
    fieldType: "singleSelect",
    options: [
      { id: 1, optionText: "Regular User", value: false },
      { id: 2, optionText: "Public Figure", value: true },
    ],
  },
  {
    id: 2,
    label: "What's your gender?",
    field: "gender",
    fieldType: "singleSelect",
    options: [
      { id: 1, optionText: "Male", value: "Male" },
      { id: 2, optionText: "Female", value: "Female" },
      { id: 3, optionText: "Others", value: "Others" },
    ],
  },
  {
    id: 3,
    label: "Who are you interested in?",
    field: "interestedIn",
    fieldType: "singleSelect",
    options: [
      { id: 1, optionText: "Male", value: "Male" },
      { id: 2, optionText: "Female", value: "Female" },
      { id: 3, optionText: "Others", value: "Others" },
    ],
  },
  {
    id: 4,
    label: "What is your date of birth?",
    field: "dateOfBirth",
    fieldType: "input",
  },
];

export const paymentPlans = [
  {
    id: 4,
    duration: "12 Months",
    months: 12,
    description:
      "Annual plan – the ultimate value! Commit for a year and save the most.",
    recommended: true,
  },
  {
    id: 3,
    duration: "6 Months",
    months: 6,
    description:
      "Half-year commitment, great savings! Enjoy convenience and cost-effectiveness.",
    recommended: false,
  },
  {
    id: 2,
    duration: "3 Months",
    months: 3,
    description:
      "Quarterly plan for consistent savings. Best value for trying us out!",
    recommended: false,
  },
  {
    id: 1,
    duration: "1 Month",
    months: 1,
    description: "Try it out for a month! Flexible and commitment-free.",
    recommended: false,
  },
];

export const faqData = [
  {
    section: "General Questions About Parenti",
    items: [
      {
        question: "What is Parenti?",
        answer:
          "Parenti is a U.S.-based platform designed for individuals and couples who aspire to become parents outside the traditional expectations of marriage or romantic relationships. It provides a secure and supportive space for co-parenting partnerships, welcoming individuals, LGBTQ+ users, and couples facing fertility challenges. Parenti is committed to fostering family-building connections based on mutual values and shared goals.",
      },
      {
        question: "Who can join Parenti?",
        answer:
          "Parenti is open to individuals aged 24 to 55 who are seeking a co-parenting partner. Public figures are also welcome, with options to match with regular users or other public figures.",
      },
      {
        question: "Is Parenti available globally?",
        answer:
          "Currently, Parenti is available in the United States, but global expansion is in the works.",
      },
      {
        question: "Do I need children to join Parenti?",
        answer:
          "No, Parenti is for those who are beginning their parenting journey, whether they already have children or are planning to have them in the future.",
      },
    ],
  },
  {
    section: "Features and Functionality",
    items: [
      {
        question: "How does Parenti work?",
        answer:
          "Users create detailed profiles outlining their parenting goals, values, and preferences. Free-tier users receive one swipe per day, while premium members enjoy unlimited swipes, advanced filters, and profile insights. Once matched, users can chat, verify their profiles, and discuss co-parenting goals.",
      },
      {
        question: "Can couples join Parenti?",
        answer:
          "Yes, couples struggling to conceive can join Parenti to find a co-parent who aligns with their family-building goals.",
      },
      {
        question: "Does Parenti welcome LGBTQ+ individuals?",
        answer:
          "Absolutely. Parenti is an inclusive platform for LGBTQ+ users seeking co-parenting partnerships.",
      },
      {
        question: "Does Parenti offer premium memberships?",
        answer:
          "Yes, premium memberships provide benefits such as unlimited swipes, advanced filters, incognito mode, and access to exclusive events.",
      },
      {
        question: "Can public figures join Parenti?",
        answer:
          "Yes, public figures can create private profiles and match with regular users or other public figures while maintaining their privacy.",
      },
      {
        question: "Does Parenti offer medical or fertility support?",
        answer:
          "Yes, Parenti refers matched users to trusted clinics and fertility specialists for expert guidance and support.",
      },
    ],
  },
  {
    section: "Privacy and Security",
    items: [
      {
        question: "How does Parenti protect my privacy?",
        answer:
          "Parenti uses advanced privacy features like incognito mode, private profile images, and robust security measures to safeguard user data. Public figures can opt for enhanced privacy settings.",
      },
      {
        question: "Can I verify my profile?",
        answer:
          "Yes, users can verify their identity, background, work, and health information. Verified profiles receive badges:\n\n• Star Check (Gold Badge): Full verification (identity, background, work, medical health, and personal references).\n• Blue Check: Basic verification (identity, personal references, and background).",
      },
      {
        question: "Are background checks mandatory?",
        answer:
          "No, background checks are optional but strongly recommended to build trust and improve matching opportunities. Parenti collaborates with third-party providers to conduct legitimate background checks.",
      },
      {
        question: "Does Parenti collect sensitive information?",
        answer:
          "Parenti collects sensitive information, such as health details and racial/ethnic origin, only with user consent. This data is used to enhance the matching process and overall user experience.",
      },
      {
        question: "Can users provide personal references?",
        answer:
          "Yes, users can choose to provide personal references to validate their trustworthiness and readiness for co-parenting.",
      },
    ],
  },
  {
    section: "Using the App",
    items: [
      {
        question: "How do I sign up?",
        answer:
          "You can sign up using your email, phone number, or Instagram/Facebook account. Simply download the app and follow the registration process.",
      },
      {
        question: "How does matching work?",
        answer:
          "Users swipe on profiles. Free-tier users get one swipe per day, while premium users enjoy unlimited swipes and advanced filters for better matches.",
      },
      {
        question: "What happens after matching?",
        answer:
          "Matched users can chat, share hidden photos, and discuss co-parenting goals. Verification options are available to enhance trust.",
      },
      {
        question: "Can I unmatch with someone?",
        answer:
          "Yes, you can unmatch at any time if the connection does not align with your goals.",
      },
      {
        question: "Can I pause my account?",
        answer:
          "Yes, you can pause your account and return whenever you are ready.",
      },
    ],
  },
  {
    section: "Payments and Memberships",
    items: [
      {
        question: "Is Parenti free to use?",
        answer:
          "Parenti offers a free tier with one swipe per day. Premium memberships unlock additional features, including unlimited swipes, advanced filters, and more.",
      },
      {
        question: "What are the premium membership plans?",
        answer:
          "• Weekly: $9.99 (Parenting Users) / $14.99 (Public Figures)\n• Monthly: $39.99 (Parenting Users) / $59.99 (Public Figures)\n• Quarterly: $89.99 (Parenting Users) / $149.99 (Public Figures)\n• Yearly: $239.99 (Parenting Users) / $359.99 (Public Figures)",
      },
      {
        question: "Can I cancel my subscription?",
        answer:
          "Yes, you can cancel your subscription anytime through your app store or account settings. Premium features remain active until the end of the billing cycle.",
      },
      {
        question: "Do you offer refunds?",
        answer:
          "Subscriptions are non-refundable. For billing concerns, please contact support@parenti.co.",
      },
    ],
  },
];
