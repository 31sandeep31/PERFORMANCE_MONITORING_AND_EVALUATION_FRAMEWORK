// Per-KPI hints distilled from M&E_Report.docx (Concept, Data sources, Measures, Tips).
// Shown in the "?" popover on each KPI card.

window.KPI_HINTS = {
  1: {
    concept: "Percentage of population in the utility's service area served by functioning house/premises connections + community/public taps.",
    data: "Demographic statistics of service area; utility database of functional connections (HH + persons per connection); annual report; municipality statistics.",
    notes: [
      "'Functioning' = water actually running through the connection at time of inspection.",
      "Service area must be clearly defined; align with local government if not yet specified.",
      "Excludes institutional/non-residential population.",
    ],
  },
  2: {
    concept: "Adequacy of water available daily and average per-capita consumption.",
    data: "Consumer satisfaction survey (within last 2 years); meter reading log book; user database (residents + non-residents).",
    notes: [
      "If 100% of surveyed consumers say water is sufficient for ALL daily needs, KPI-2 = 100.",
      "Adequate per-capita: ≥ 100 lpcd (urban), ≥ 45 lpcd (rural).",
      "If actual consumption records are unreliable, fall back to consumer perception data.",
    ],
  },
  3: {
    concept: "Extent to which supplied water meets the National Drinking Water Quality Standards (NDWQS, 2062).",
    data: "Consumer survey; residual chlorine log book; daily/monthly physicochemical and microbiological logs; certified-lab reports for arsenic, chemicals, heavy metals.",
    notes: [
      "Subsets 3.2 and 3.4 score 0 if water samples were tested for fewer than 330 days in the year.",
      "Residual chlorine must be 0.1–0.2 mg/l at the last taps of every distribution branch.",
      "Failure of any single chemical/heavy-metal parameter = compliance failure for the whole sample.",
    ],
  },
  4: {
    concept: "Proportion of households with safe & reliable piped water on-site (house/premises) vs off-site (public/community taps).",
    data: "Utility's database on functional status of connections and HH/persons served per connection.",
    notes: [
      "'Easily accessible' tap = ≤ 30 min round-trip OR ≤ 100 m from point of demand.",
      "Push for individual house connections via affordable connection charges.",
    ],
  },
  5: {
    concept: "Continuity (hours/day) and regularity (days without service disruption) of water supply.",
    data: "Daily supply hour log; service-disruption records for the assessment year.",
    notes: [
      "A disruption day = supply down >50% of normal hours OR affecting >25% of users.",
      "≥ 15 disruption days in year = subset 5.2 scores 0.",
    ],
  },
  6: {
    concept: "How comprehensively the utility tracks its physical infrastructure (location, condition, O&M history).",
    data: "Inventory book / digital asset register; Asset Layout Plan; Asset Management Plan; NWASH MIS uploads.",
    notes: [
      "Best practice: digital inventory + GIS map + Asset Management Plan implemented + uploaded to NWASH MIS.",
      "Maintain a depreciation reserve fund.",
    ],
  },
  7: {
    concept: "Capability and efficiency of carrying out planned and unplanned maintenance.",
    data: "Staff register (engineer/sub-engineer/plumber); maintenance log book of planned PPM and breakdown repairs.",
    notes: [
      "Maintenance efficiency = repairs done ÷ repairs required (planned + unplanned).",
      "Allocate sufficient budget for planned PPM.",
    ],
  },
  8: {
    concept: "Mean Time to Repair – speed at which unplanned breakdowns are restored.",
    data: "O&M reserve fund records; repair log book with start/end times and duration.",
    notes: [
      "ART ≤ 24 hr/event ⇒ full score; ART ≥ 72 hr/event ⇒ 0.",
      "Build/maintain dedicated O&M reserve fund to fund quick repairs.",
    ],
  },
  9: {
    concept: "Non-Revenue Water = (water supplied – water billed) ÷ water supplied. Lower is better.",
    data: "Bulk-meter records into distribution; total billed volume; leak survey reports.",
    notes: [
      "NRW ≤ 20% ⇒ full score; NRW ≥ 50% ⇒ 0.",
      "Causes: leaks, illegal connections, meter under-reading, unmetered uses.",
    ],
  },
  10: {
    concept: "Water tariff policy + water/connection affordability for low-income households.",
    data: "Tariff schedule; subsidy register; income survey of low-income HH.",
    notes: [
      "Block tariff with cross-subsidy = best practice.",
      "Monthly water bill (8 m³) should not exceed ~2-5% of low-income HH monthly income.",
      "New connection charge ≤ 5-25% of low-income HH annual income.",
    ],
  },
  11: {
    concept: "Operating Ratio = operating revenue ÷ operating costs (excluding depreciation).",
    data: "Audited income statement; operating expense ledger.",
    notes: [
      "Ratio ≥ 1.2 indicates healthy cost recovery.",
      "Ratio < 1.0 means utility cannot meet operating costs from revenue.",
    ],
  },
  12: {
    concept: "Contribution to Investment = utility's own funds applied to capital expenditure.",
    data: "Capital budget; reserve fund use; loan/grant register.",
    notes: [
      "Higher self-financed CapEx = stronger financial autonomy.",
      "Build depreciation reserve to fund replacements.",
    ],
  },
  13: {
    concept: "Financial transparency through audited annual accounts.",
    data: "Audit reports; AGM minutes; uploaded financials in NWASH MIS.",
    notes: [
      "Best practice: external audit + disclosure to consumers + AGM presentation + MIS upload.",
    ],
  },
  14: {
    concept: "Share of connections with working volumetric meters.",
    data: "Customer database; meter installation/replacement log.",
    notes: [
      "Metering enables volumetric billing, leak detection, and equity in tariffs.",
      "Replace faulty meters within an annual cycle.",
    ],
  },
  15: {
    concept: "Billing efficiency (HH billed) and Collection efficiency (cash recovered).",
    data: "Billing register; cash collection ledger; accounts-receivable aging report.",
    notes: [
      "Target both at 95%+ for healthy cash flow.",
      "Disconnect for non-payment after defined grace period (per by-laws).",
    ],
  },
  16: {
    concept: "Quality of customer database (consumer info, status, contact, history).",
    data: "Customer database (paper/spreadsheet/computerized); MIS integration logs.",
    notes: [
      "Live database integrated with billing/MIS = best practice.",
      "Update at least at every meter reading cycle.",
    ],
  },
  17: {
    concept: "Effectiveness of complaint mechanism and how many complaints actually get resolved.",
    data: "Complaint register; resolution log with closure dates; SLA compliance report.",
    notes: [
      "Multi-channel intake (in-person, phone, online) + tracked closure = best practice.",
      "Aim for ≥ 90% resolution within published SLAs.",
    ],
  },
  18: {
    concept: "Periodic structured surveys of consumer satisfaction.",
    data: "Survey design, sample list, response data, action plan tracking.",
    notes: [
      "Annual survey + documented action plan based on findings = best practice.",
      "Sample at least 1% of consumers, fully representing the service area.",
    ],
  },
  19: {
    concept: "Existence and active implementation of a Business Plan.",
    data: "Business Plan document; annual progress review minutes; updated targets.",
    notes: [
      "Plan should align with NWASH MIS Municipal Plan and SDG targets.",
      "Track KPI targets year-over-year against Business Plan baseline.",
    ],
  },
  20: {
    concept: "Identifying training needs and delivering Capacity Development.",
    data: "Annual Training Needs Assessment (TNA); training calendar; participation records.",
    notes: [
      "Annual TNA + multi-year HRD plan = best practice.",
      "Track delivered vs planned trainings.",
    ],
  },
  21: {
    concept: "Gender Equality and Social Inclusion (GESI) in policy, staffing, and training.",
    data: "GESI policy; women in committee/staff records; training participation by gender.",
    notes: [
      "Adopt + implement gender and SI policies; ensure marginalized representation.",
      "Track women staff trained ÷ total staff trained.",
    ],
  },
  22: {
    concept: "Regularity of Annual General Meetings.",
    data: "AGM minutes; annual report; consumer attendance lists.",
    notes: [
      "Hold AGM annually with strong consumer participation; publish minutes.",
    ],
  },
  23: {
    concept: "Organizational maturity – environmental sanitation, climate adaptation, and strategic restructuring.",
    data: "Sanitation plan; climate-adaptation plan; organization-structure review documents.",
    notes: [
      "Integrate climate-adaptation actions into Business Plan.",
      "Periodically review and adjust staffing/organizational structure.",
    ],
  },
};
