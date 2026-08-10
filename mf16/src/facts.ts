/**
 * facts.ts — ACCURACY FIREWALL
 *
 * Source: ASSEB Finance, Textbook for Class XII (Assam State School Education
 * Board, Division-II). First Edition May 2023, reprints April 2024 / April 2025.
 * Chapter 16 "Mutual Fund", pages 188–196. Unit IV — Financial Services.
 *
 * Everything the app displays about the chapter comes from here.
 * Do NOT paraphrase textbook wording. Do NOT add items. If you think something
 * is wrong, flag it in your response — do not silently edit.
 *
 * `provenance: 'textbook'`    → reproduce as written, examiner marks against it
 * `provenance: 'derived'`     → assembled from textbook prose (e.g. "features",
 *                               which the chapter does not head separately)
 * `provenance: 'illustrative'`→ NOT from the book; must render with a disclaimer
 */

export type Provenance = 'textbook' | 'derived' | 'illustrative';

export const chapter = {
  number: 16,
  title: 'Mutual Fund',
  unit: 'Unit IV — Financial Services',
  unitNote:
    'Financial services are classified as fund-based and fee-based. Fund-based services are covered in Chapters 13–17 (Modern Banking Services, Lease, Hire-Purchase, Mutual Fund, Venture Capital & Factoring); fee-based services in Chapter 18 (Stock Broking, Credit Rating, Merchant Banking).',
  pages: '188–196',
  provenance: 'textbook' as Provenance,
};

/* ------------------------------------------------------------------ MEANING */

export const meaning = {
  definition:
    'Mutual fund is a collective investment created through mutual contributions made by large numbers of small savers who have no expertise knowledge to undertake investment in equities successfully.',
  vehicle:
    'Mutual fund is basically an investment vehicle through which the fund managers pool fund to invest in shares and debentures.',
  managers:
    'Financial institutions, private companies and public companies are seen taking initiative as fund manager.',
  unit:
    'The fund created by the contributions of investors is divided into equal portions called unit.',
  unitPricing:
    'The price of each unit is governed by value of underlying investments.',
  initialOfferPrice: 10, // rupees — INITIAL offer price only, not the ongoing price
  initialOfferPriceNote:
    'The initial offer price of each unit is basically Rs. 10.',
  flexibility:
    'Facilities such as Systematic Investment Plan (SIP), Systematic Withdrawal Plan (SWP) and Systematic Transfer Plan (STP) provide greater flexibility in investing in mutual fund.',
  provenance: 'textbook' as Provenance,
};

/* ---------------------------------------------------------------------- NAV */

export const nav = {
  expansion: 'Net Asset Value',
  textbookWording:
    'Total value of a scheme minus liabilities and then divided by outstanding number of units calculates the NAV.',
  formula: 'NAV = (Total value of the scheme − Liabilities) ÷ Number of outstanding units',
  order: 'Subtract liabilities first. Divide by units second. Never the reverse.',
  provenance: 'textbook' as Provenance,
};

/** Worked figures used by the NAV vessel + calculator. Verified arithmetic. */
export const navWorked = [
  { label: 'Preset A', totalValue: 5_200_000, liabilities: 200_000, units: 500_000, expectedNav: 10 },
  { label: 'Preset B', totalValue: 84_000_000, liabilities: 4_000_000, units: 4_000_000, expectedNav: 20 },
  { label: 'Preset C', totalValue: 9_600_000, liabilities: 600_000, units: 600_000, expectedNav: 15 },
] as const;

/* ------------------------------------------------------------------ PARTIES */

export const parties = [
  { id: 'sponsor', name: 'Sponsor', role: 'The promoter — establishes the mutual fund and gets it registered.' },
  { id: 'trustee', name: 'Trustee', role: 'Holds the fund in trust for the investors and supervises that the scheme is run in the investors’ interest.' },
  { id: 'custodian', name: 'Custodian', role: 'Holds the securities of the scheme in safe custody and handles delivery and settlement.' },
  { id: 'amc', name: 'Asset Management Company (AMC)', role: 'The fund manager — takes the investment decisions and manages the portfolio.' },
  { id: 'investor', name: 'Beneficial Owner (Investors)', role: 'The unit-holders. They own the beneficial interest; the returns belong to them.' },
] as const;
export const partiesProvenance: Provenance = 'textbook'; // names verbatim; role lines are derived one-liners

/* -------------------------------------------- CLASSIFICATION I — OPERATION */

export const typesByOperation = [
  {
    id: 'closed',
    name: 'Closed-ended funds',
    text: 'Under this scheme, the corpus of the fund is fixed and fund’s life is prefixed. That is, the funds are redeemable or returnable to investors only after expiry of the term. Thus, entry and exit of the investors from the fund is not allowed once the scheme is closed. However, if an existing investor wishes to sell the holdings before the date of maturity of the fund, he may do so in the stock exchange where the units are listed.',
  },
  {
    id: 'open',
    name: 'Open-ended funds',
    text: 'Under this scheme of mutual fund, the fund size and the period of investment is not pre-fixed. A person willing to invest in mutual fund can invest at any time and also can redeem his investment as and when required. That is, the purchase and sale of units in open-end mutual fund is not restricted. They invest or may sell the holdings directly to the AMC issuing the units.',
  },
  {
    id: 'interval',
    name: 'Interval funds',
    text: 'Interval funds combine the features of open-ended and closed-ended schemes. These funds are open for purchase or redemption during specific intervals at Net Asset Value (NAV) and closed the rest of time. The units under this scheme are traded in stock exchange.',
  },
] as const;
export const typesByOperationProvenance: Provenance = 'textbook';

/* ------------------------------------------------ CLASSIFICATION II — YIELD */

/**
 * NINE types in the chapter's main body.
 * WARNING — the chapter SUMMARY lists only EIGHT: it omits (ix) real estate funds.
 * Surface this discrepancy to the student as a trap. Main body wins.
 */
export const typesByYield = [
  { id: 'growth', n: 'i', name: 'Growth-oriented fund', text: 'It is a form of mutual fund scheme under which income generated by the invested fund isn’t distributed among the unit-holders or investors. In turn, income generated by the investments is allocated proportionately towards the initial investment. So, the size of investment of the unit holders goes on increasing provided the scheme of investments generate income.' },
  { id: 'income', n: 'ii', name: 'Income-oriented fund', text: 'In contrast to growth-oriented fund, income-oriented fund is a scheme which aims at distribution of the income generated by the investments among the unit-holders, as dividend. This form of mutual fund is popular among those small investors who prefer regular income and at the same time defer to bear high risk, say retired persons.' },
  { id: 'balanced', n: 'iii', name: 'Balanced mutual fund', text: 'In this type of mutual fund, the fund is invested both in equities and interest-bearing instruments such as debentures and preference shares. Return from investment in equities is uncertain but there is chance for appreciation in investment, while in case of fixed interest-bearing instrument the return is certain and fixed. Thus, the investors are ensured the benefit of appreciation in equities as well as ascertained return.' },
  { id: 'stock', n: 'iv', name: 'Stock fund', text: 'Stock funds are invested in securities of different companies varying from highly rated companies to newly established companies. Such funds are suitable for those who can resist significant risks for higher returns.' },
  { id: 'leverage', n: 'v', name: 'Leverage fund', text: 'It is a type of fund which combines the borrowed fund with own fund. The fund is invested in speculative stock that ensures higher profit in the future. From the profit earned, interest on borrowed fund is paid and the balance is distributed among unit holders. Thus, the unit holders get higher rate of profit.' },
  { id: 'taxrelief', n: 'vi', name: 'Tax relief fund', text: 'Tax relief fund, also known as equity-linked savings schemes, are essentially closed-end mutual fund. The investment is made in such equity shares that it entitles the investors to claim deduction or rebate in income tax subject to the provisions of the Income Tax Act, 1961. The investors are required to keep their fund for a minimum number of years called lock-in-period within which they cannot sell investment.' },
  { id: 'bonds', n: 'vii', name: 'Bonds fund', text: 'Bonds are more liquid, diversified and conservative investments with modest capital gains. Some of the bonds are sold in the market at a discount to face value. Bonds selected for investment are highly secured with steady income and at the same time carry lesser risk of default. This type of mutual fund is popular among the investors who prefer fixed return but desire safety of funds.' },
  { id: 'mmmf', n: 'viii', name: 'Money market mutual fund (MMMF)', text: 'It is a scheme which has been set up to invest in money market instruments such as treasury bills, certificate of deposits, commercial papers, bill discounting etc. The investments in MMMF are subject to guidelines laid down by the Reserve Bank of India.' },
  { id: 'realestate', n: 'ix', name: 'Real estate funds', text: 'These funds are invested in real estate ventures. Real estate fund is basically closed-end mutual fund. Such funds are of various types depending upon real estate transactions.' },
] as const;
export const typesByYieldProvenance: Provenance = 'textbook';
export const typesByYieldTrap =
  'The chapter’s main body lists NINE types (i–ix). The chapter’s Summary lists only EIGHT — it drops real estate funds. Revise from the main body.';

/**
 * Illustrative-only coordinates for the 3D risk/return/liquidity space.
 * NOT textbook data. Must render with a visible disclaimer chip.
 * Each axis 0–1. liquidity: 1 = highly liquid, 0 = long lock-in.
 */
export const typePositions: Record<string, { risk: number; ret: number; liquidity: number }> = {
  mmmf: { risk: 0.10, ret: 0.14, liquidity: 0.96 },
  bonds: { risk: 0.22, ret: 0.26, liquidity: 0.72 },
  income: { risk: 0.36, ret: 0.38, liquidity: 0.70 },
  balanced: { risk: 0.52, ret: 0.55, liquidity: 0.66 },
  taxrelief: { risk: 0.44, ret: 0.64, liquidity: 0.12 },
  growth: { risk: 0.68, ret: 0.70, liquidity: 0.62 },
  realestate: { risk: 0.60, ret: 0.48, liquidity: 0.16 },
  stock: { risk: 0.82, ret: 0.82, liquidity: 0.58 },
  leverage: { risk: 0.95, ret: 0.93, liquidity: 0.40 },
};
export const typePositionsProvenance: Provenance = 'illustrative';

/* ----------------------------------------------------- OPEN vs CLOSED TABLE */

/**
 * Six bases, verbatim from the chapter's comparison table.
 * A 5-mark "distinguish" answer needs FIVE rows minimum — six are available.
 * `feature3d` links each row to its element in the 3D corpus scene (Phase 5).
 */
export const differences = [
  { basis: 'Nature', open: 'The scheme remains open for investment or sale of investment.', closed: 'The scheme is closed for investment and for sale of investment.', feature3d: 'lid' },
  { basis: 'Size of Corpus', open: 'The size of the corpus is not fixed.', closed: 'The maximum size of the fund is pre-fixed and can’t be exceeded.', feature3d: 'container-volume' },
  { basis: 'Liquidity of investment', open: 'The investment is highly liquid. An investor can sell his fund at any time.', closed: 'Not fully liquid because after initial investment an investor has to stay with fund till the lock-in period is over.', feature3d: 'exit-flow' },
  { basis: 'Listing in stock exchange', open: 'Under this scheme, units are not listed in stock exchange.', closed: 'Under this scheme, units are listed in stock exchange.', feature3d: 'exchange-door' },
  { basis: 'Time of purchase and sale', open: 'Units are available for purchase at any point of time. There is no question of specific size of the fund.', closed: 'Units are not available for purchase after the fund size achieves its target.', feature3d: 'amc-counter' },
  { basis: 'Maturity', open: 'There is no fixed maturity time for receiving value of the units purchased.', closed: 'There is fixed maturity time on expiry of which the value of the unit is paid.', feature3d: 'maturity-gate' },
] as const;
export const differencesProvenance: Provenance = 'textbook';
export const differencesTrap =
  'Students swap the listing row. Anchor it: CLOSED-ended is the one that is listed, because the exchange is its only exit. Open-ended needs no exchange — the AMC buys back directly.';

/* ------------------------------------------------------------------ BENEFITS */

/**
 * EIGHT benefits in the chapter's main body.
 * WARNING — the Summary lists only SEVEN: it drops (7) Protected investment.
 */
export const benefits = [
  { n: 1, name: 'Liquidity', text: 'Investment in mutual fund provides easy liquidity to those who want to dispose of their units. Open-end mutual funds may be sold back to AMC while closed-end mutual fund can be sold in stock exchange where it is listed.' },
  { n: 2, name: 'Risk diversification', text: 'Mutual fund is invested in diversified portfolios and in a number of companies. This reduces the risk of investment because seldom stocks value decline in the same proportion.' },
  { n: 3, name: 'Return', text: 'Investment in mutual fund provides higher return potential to the investors as the fund is invested carefully in selected securities.' },
  { n: 4, name: 'Service of professional management', text: 'Mutual fund is invested in selected securities by experienced and skilled professionals who have experience and knowledge on portfolio management.' },
  { n: 5, name: 'Convenience', text: 'Mutual fund investment is very simple because it does not involve much paper works and also avoids problems such as delayed payments, bad deliveries and unnecessary follow-up with brokers.' },
  { n: 6, name: 'Less costly', text: 'Because of large scale investment size, the cost of brokerage, paper works, custodial and other charges translate into lower expense for investors.' },
  { n: 7, name: 'Protected investment', text: 'All mutual funds are registered with SEBI. And they function within the provisions of strict regulation designed to protect the interest of the investors.' },
  { n: 8, name: 'Tax benefit', text: 'Many of the mutual funds offer the benefit of tax exemptions to the investors under the Income Tax Act.' },
] as const;
export const benefitsProvenance: Provenance = 'textbook';
export const benefitsTrap =
  'The main body lists EIGHT benefits. The Summary lists only SEVEN — it drops "Protected investment" (the SEBI point). Revise from the main body.';
export const benefitsStrongestFive = ['Risk diversification', 'Service of professional management', 'Liquidity', 'Less costly', 'Protected investment'];

/* --------------------------------------------------------------- FLEXIBILITY */

export const plans = [
  { abbr: 'SIP', full: 'Systematic Investment Plan', use: 'Invest a fixed sum at fixed regular intervals instead of one lump sum.' },
  { abbr: 'SWP', full: 'Systematic Withdrawal Plan', use: 'Withdraw a fixed sum at fixed regular intervals instead of redeeming everything at once.' },
  { abbr: 'STP', full: 'Systematic Transfer Plan', use: 'Transfer a fixed sum at fixed intervals from one scheme to another.' },
] as const;

/** SIP rupee-cost-averaging worked example. Arithmetic verified. */
export const sipWorked = {
  monthly: 2000,
  months: [
    { m: 1, navValue: 10, units: 200 },
    { m: 2, navValue: 8, units: 250 },
    { m: 3, navValue: 12.5, units: 160 },
  ],
  totalInvested: 6000,
  totalUnits: 610,
  costPerUnit: 9.84,   // 6000 / 610 = 9.8360…
  averageNav: 10.17,   // (10 + 8 + 12.50) / 3 = 10.1666…
  lesson: 'The fixed rupee amount automatically bought more units when NAV was low and fewer when it was high, so cost per unit came in below the average NAV.',
} as const;

/* ------------------------------------------------------- MUTUAL FUNDS IN INDIA */

export const indiaTimeline = [
  { year: null, key: true, event: 'The need for institutionalisation of mutual fund was felt first time by Pandit Jawaharlal Nehru, former Prime Minister of the country.' },
  { year: 1963, key: true, event: 'The idea of mutual fund began to take shape with the enactment of the Unit Trust of India Act, 1963.' },
  { year: 1964, key: true, event: 'Unit Trust of India was established to operate as a financial institution and an investment trust. In 1964 the board of trustees formulated an open-end scheme and launched it at the nominal value of Rs. 10 each.' },
  { year: 1987, key: false, event: 'State Bank of India (1987) and Canara Bank (1987) entered the mutual fund business.' },
  { year: 1989, key: false, event: 'Life Insurance Corporation entered the mutual fund business.' },
  { year: 1990, key: false, event: 'Indian Bank, Bank of India and Punjab National Bank launched mutual funds.' },
  { year: 1991, key: false, event: 'General Insurance Corporation entered. Public sector units enjoyed monopoly in the industry till 1991; private players were allowed with liberalisation and the financial market reforms from 1991.' },
  { year: 1993, key: true, event: 'The first private sector mutual fund pioneering in the field was Kothari, which launched mutual fund in 1993. Later Morgan Stanley, Jardine Fleming, George Soros and Capital International joined.' },
] as const;
export const indiaTrap =
  'The Unit Trust of India ACT is 1963. The INSTITUTION UTI was established in 1964. Read which noun the question names before writing the year.';

/* ------------------------------------------------------------- EXAM METADATA */

export const paperPattern = {
  board: 'ASSEB / AHSEC',
  subject: 'Finance',
  fullMarks: 80,
  passMarks: 24,
  hours: 3,
  source: 'ASSEB 2025 question paper',
  sections: [
    { q: 'Q1', marks: 1, count: 6, total: 6, choice: 'Answer any six' },
    { q: 'Q2', marks: 2, count: 4, total: 8, choice: 'All' },
    { q: 'Q3', marks: 3, count: 4, total: 12, choice: 'Answer any four' },
    { q: 'Q4', marks: 5, count: 6, total: 30, choice: 'Answer any six' },
    { q: 'Q5', marks: 8, count: 3, total: 24, choice: 'Answer any three' },
  ],
} as const;

export const markBandRules = {
  1: 'Single fact or term. No sentence needed.',
  2: 'Two points, or one definition plus one supporting line.',
  3: 'Three points, one short line each. NO introduction, NO conclusion.',
  5: 'Five points, one tight explanatory line each. Table if the question says "distinguish".',
  8: 'Two-line introduction → eight numbered points with 2–3 lines each → one-line conclusion. About 300 words.',
} as const;

/** Confirmed appearances in the AHSEC/ASSEB PYQ archive held by Kapil. */
export const pyq = [
  { year: 2024, marks: 5, stem: 'Write the advantages of investing in mutual funds.', placement: 'Alternative in Q10', course: 'new' },
  { year: 2023, marks: 2, stem: 'Write two features of Mutual Fund.', placement: 'Q3, compulsory', course: 'new' },
  { year: 2019, marks: 5, stem: 'Mention five advantages of Mutual Funds.', placement: 'Alternative in Q14', course: 'old' },
] as const;
export const pyqNote =
  'Benefits/advantages is the confirmed repeater: 2019 and 2024, both 5 marks, effectively identical stems. No standalone Mutual Fund question appeared in the 2025 paper in the archive — the chapter is due.';

/** Printed exercise questions at the end of Chapter 16. */
export const textbookQuestions = [
  { marks: 1, q: 'Write the full form of SIP.' },
  { marks: 1, q: 'Write the first Mutual Fund institution of India.' },
  { marks: 1, q: 'In which year the UTI was established?' },
  { marks: 1, q: 'Write the full form of NAV.' },
  { marks: 2, q: 'What is growth-oriented mutual fund?' },
  { marks: 2, q: 'Explain stock mutual fund.' },
  { marks: 2, q: 'What is MMMF?' },
  { marks: 2, q: 'Explain how NAV is calculated?' },
  { marks: 2, q: 'What are the Units of mutual fund?' },
  { marks: 2, q: 'What are the various parties involved in Mutual fund?' },
  { marks: 5, q: 'Distinguish between Open-ended and Closed-ended mutual fund.', type: 'distinguish' },
  { marks: 5, q: 'Write the benefits of investing in mutual funds.' },
  { marks: 5, q: 'Explain various types of Mutual fund on the basis of Operation or Execution.' },
  { marks: 8, q: 'Explain various types of Mutual fund on the basis of Investment pattern.' },
] as const;

/** Questions the answer-trainer must force into a TABLE, never prose. */
export const distinguishQuestions = ['Distinguish between Open-ended and Closed-ended mutual fund.'];

/* ------------------------------------------------------------- KILL-LIST */

export const killList = [
  'Writing "the price of a unit is ₹10". ₹10 is the INITIAL OFFER price only; after launch price follows NAV.',
  'Dividing before subtracting in NAV. Net liabilities off the scheme value first, then divide by units.',
  'Saying a closed-ended investor cannot sell before maturity. He cannot REDEEM; he can sell on the stock exchange where units are listed.',
  'Swapping the listing row. Closed-ended units are listed; open-ended units are not.',
  'Answering a "distinguish" question in prose. It is always a ruled table with the basis in column one.',
  'Giving four rows for a 5-mark table. Five marks, five rows — six bases are available.',
  'Revising types from the Summary: it lists eight, the main body lists nine (real estate dropped).',
  'Revising benefits from the Summary: it lists seven, the main body lists eight (protected investment dropped).',
  'Confusing growth with income funds. Growth RETAINS income; income DISTRIBUTES it as dividend.',
  'Answering 1964 for the Unit Trust of India ACT. The Act is 1963; the institution is 1964.',
  'Attributing MMMF regulation to SEBI. Funds register with SEBI, but MMMF follows RBI guidelines.',
  'Listing eight benefits as bare words for a 5-mark question. Five explained beats eight naked.',
] as const;

/* ------------------------------------------------------------- NARRATION */

/** Spoken narration for the 3D scenes. Keep in sync with scene steps. */
export const narration = {
  pool: [
    'Four small savers each put in a modest amount. None of them has the expertise to pick shares on their own.',
    'Their contributions are pooled into a single corpus. That corpus is the mutual fund scheme.',
    'The corpus is divided into equal portions called units. Notice the units are identical, even though the contributions were not. At launch, the initial offer price of each unit is basically ten rupees.',
    'The pooled money is handed to an Asset Management Company, the fund manager, who takes the investment decisions.',
    'The A M C spreads it across equity shares, debentures and money market instruments. Watch them move independently. That is why diversification reduces risk — stocks seldom decline in the same proportion.',
    'Returns, as dividend or capital appreciation, flow back to the same unit holders, in proportion to the units each one holds.',
  ],
  navVessel: [
    'Start with the total value of the scheme. Every asset at market value. Say fifty two lakh rupees.',
    'Now carve out the liabilities of the scheme. Here, two lakh rupees. Notice they come out of the pool, not out of each unit.',
    'What remains is net assets. Fifty lakh rupees.',
    'Slice that volume into the outstanding units. Five lakh of them.',
    'The height of one slice is the N A V. Ten rupees per unit. Subtract first, divide second. Never the other way round.',
  ],
  corpus: [
    'On the left, a closed-ended scheme. The corpus is fixed and the life of the fund is pre-fixed.',
    'Once the offer closes the lid seals. No new money enters, and no investor can redeem from the fund.',
    'But the investor is not trapped. The units are listed, so he can leave through the stock exchange door.',
    'At maturity the gate opens and the value of the units is paid.',
    'On the right, an open-ended scheme. No lid, no fixed size. Investors buy and redeem directly at the A M C counter, at any time.',
    'And there is no exchange here at all — the A M C is always the buyer, so listing is unnecessary. Every row of the differences table follows from that one structural fact.',
  ],
} as const;
