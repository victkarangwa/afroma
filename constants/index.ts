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
