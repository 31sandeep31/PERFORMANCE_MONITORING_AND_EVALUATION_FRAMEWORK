// KPI configuration based on M&E Framework (M&E_Report.docx)
// 23 KPIs in 2 categories. Each subset has weight and a calculation method.
// All weights in a KPI sum to <= 1.0; final KPI score is in percent (0-100).

window.KPI_CONFIG = [
  // ===== CATEGORY A: Level and Quality of Water Supply Service =====
  {
    id: 1, category: "A", name: "Water Service Coverage",
    description: "Percentage of population in service area served by functioning house/premises connections + community/public taps.",
    subsets: [
      {
        id: "1.1", name: "Service coverage", type: "quantitative", weight: 1.0,
        unit: "%",
        inputs: [
          { id: "pop_service",  label: "Total population in utility's service area", unit: "persons", default: 0 },
          { id: "pop_house",    label: "Population served by functioning house/premises connections", unit: "persons", default: 0 },
          { id: "pop_public",   label: "Population served by functioning public/community taps", unit: "persons", default: 0 },
        ],
        compute: (v) => v.pop_service > 0
          ? Math.min(100, (v.pop_house + v.pop_public) / v.pop_service * 100) : 0,
      }
    ],
  },

  {
    id: 2, category: "A", name: "Sufficiency",
    description: "Adequacy of water available daily for personal/domestic uses.",
    serviceAreaType: true, // toggle urban/rural
    subsets: [
      {
        id: "2.1", name: "Consumers' perception", type: "qualitative-percent", weight: 0.5,
        inputs: [
          { id: "p_a", label: "A) % consumers reporting water is sufficient for ALL daily needs", unit: "%", default: 0, optionWeight: 0.75 },
          { id: "p_b", label: "B) % consumers reporting water adequate for basic uses but not all needs", unit: "%", default: 0, optionWeight: 0.25 },
          { id: "p_c", label: "C) % consumers reporting water enough only for drinking/cooking/toilet", unit: "%", default: 0, optionWeight: 0.0 },
        ],
        compute: (v) => v.p_a * 0.75 + v.p_b * 0.25 + v.p_c * 0.0,
      },
      {
        id: "2.2", name: "Per capita consumption (PCC)", type: "quantitative", weight: 0.5,
        unit: "lpcd",
        inputs: [
          { id: "vol_billed", label: "Total volume billed to domestic consumers in year (m3)", unit: "m3", default: 0 },
          { id: "n_users",    label: "Total residents + non-residents consuming water", unit: "persons", default: 0 },
        ],
        compute: (v, ctx) => {
          if (!v.n_users) return 0;
          const pcc = v.vol_billed * 1000 / 365 / v.n_users;
          const isUrban = ctx?.areaType === "urban";
          const target = isUrban ? 100 : 45;
          if (pcc >= target) return 100;
          if (pcc <= 20) return 0;
          return (pcc - 20) / (target - 20) * 100;
        },
      },
    ],
    // KPI-2 special rule: if perception A = 100%, KPI score = 100
    customScore: (subsetScores, vals) => {
      if ((vals?.["2.1"]?.p_a || 0) >= 100) return 100;
      return null; // null = use default weighted sum
    },
  },

  {
    id: 3, category: "A", name: "Quality",
    description: "Extent to which water meets drinking water quality standards.",
    subsets: [
      {
        id: "3.1", name: "Consumers' perception", type: "qualitative-percent", weight: 0.3,
        inputs: [
          { id: "q_a", label: "A) % HH reporting water clean & acceptable throughout year", unit: "%", default: 0, optionWeight: 0.5 },
          { id: "q_b", label: "B) % HH reporting clean but turbid in rainy days", unit: "%", default: 0, optionWeight: 0.4 },
          { id: "q_c", label: "C) % HH reporting clean but occasionally turbid even on fair days", unit: "%", default: 0, optionWeight: 0.1 },
        ],
        compute: (v) => v.q_a * 0.5 + v.q_b * 0.4 + v.q_c * 0.1,
      },
      {
        id: "3.2", name: "Public health safety - residual chlorine compliance", type: "quantitative", weight: 0.25,
        inputs: [
          { id: "rc_days_tested",   label: "Days residual chlorine was tested in year", unit: "days", default: 0 },
          { id: "rc_days_compliant",label: "Days residual chlorine was compliant with standards", unit: "days", default: 0 },
        ],
        compute: (v) => {
          if (v.rc_days_tested < 330) return 0;
          return Math.min(100, v.rc_days_compliant / v.rc_days_tested * 100);
        },
      },
      {
        id: "3.3", name: "Priority contaminant (Arsenic) compliance", type: "ynna", weight: 0.15,
        inputs: [
          { id: "arsenic", label: "Arsenic compliant with standards? (Y/N/NA)", unit: "Y/N/NA", default: "NA", options: ["Y","N","NA"] }
        ],
        compute: (v) => v.arsenic === "Y" || v.arsenic === "NA" ? 100 : 0,
      },
      {
        id: "3.4", name: "Physicochemical (daily) compliance", type: "quantitative", weight: 0.15,
        inputs: [
          { id: "pc_days_tested",   label: "Days daily-physicochemical parameters tested", unit: "days", default: 0 },
          { id: "pc_days_compliant",label: "Days physicochemical parameters compliant", unit: "days", default: 0 },
        ],
        compute: (v) => {
          if (v.pc_days_tested < 330) return 0;
          return Math.min(100, v.pc_days_compliant / v.pc_days_tested * 100);
        },
      },
      {
        id: "3.5", name: "Chemical & heavy metals compliance", type: "yn", weight: 0.15,
        inputs: [
          { id: "chem", label: "Chemical & heavy metals compliant? (Y/N)", unit: "Y/N", default: "N", options: ["Y","N"] }
        ],
        compute: (v) => v.chem === "Y" ? 100 : 0,
      },
    ],
  },

  {
    id: 4, category: "A", name: "Accessibility",
    description: "Proportion of households with on-site (house/premise) vs off-site (public/community tap) access.",
    subsets: [
      {
        id: "4.1", name: "On-site access", type: "quantitative", weight: 0.7,
        inputs: [
          { id: "hh_onsite", label: "HH with functioning house/premise connection", unit: "HH", default: 0 },
          { id: "hh_total",  label: "Total HH served through functioning connections", unit: "HH", default: 0 },
        ],
        compute: (v) => v.hh_total ? Math.min(100, v.hh_onsite / v.hh_total * 100) : 0,
      },
      {
        id: "4.2", name: "Off-site (easily accessible public/community taps)", type: "quantitative", weight: 0.3,
        inputs: [
          { id: "hh_offsite", label: "HH served via easily accessible public/community taps", unit: "HH", default: 0 },
          { id: "hh_total2",  label: "Total HH served through functioning connections", unit: "HH", default: 0 },
        ],
        compute: (v) => v.hh_total2 ? Math.min(100, v.hh_offsite / v.hh_total2 * 100) : 0,
      },
    ],
  },

  {
    id: 5, category: "A", name: "Reliability",
    description: "Continuity (hours/day) and number of disruption days.",
    subsets: [
      {
        id: "5.1", name: "Continuity (hours/day)", type: "quantitative", weight: 0.6,
        inputs: [
          { id: "hours_day", label: "Average water supply hours per day in year", unit: "hrs/day", default: 0 },
        ],
        compute: (v) => Math.min(100, v.hours_day / 24 * 100),
      },
      {
        id: "5.2", name: "Regularity (disruption days deduction)", type: "quantitative", weight: 0.4,
        inputs: [
          { id: "disrupt_days", label: "Days of service disruption in year", unit: "days", default: 0 },
        ],
        compute: (v) => {
          if (v.disrupt_days <= 0) return 100;
          if (v.disrupt_days >= 15) return 0;
          return (15 - v.disrupt_days) / 15 * 100;
        },
      },
    ],
  },

  // ===== CATEGORY B: Operational and Management Efficiency =====

  // ----- B-1 Technical Operation -----
  {
    id: 6, category: "B", subcat: "Technical Operation", name: "Asset Management",
    subsets: [{
      id: "6.1", name: "Asset management practice", type: "options", weight: 1.0,
      inputs: [{
        id: "stmt", label: "Select the statement that best describes practice", default: "A",
        options: [
          { value: "A", label: "A) No inventory of infrastructure", weight: 0 },
          { value: "B", label: "B) Limited paper inventory, not updated", weight: 0.5 },
          { value: "C", label: "C) Manually updated full inventory with O&M records", weight: 0.8 },
          { value: "D", label: "D) Up-to-date digital inventory; Asset Layout Plan in NWASH MIS", weight: 0.9 },
          { value: "E", label: "E) Digital inventory + Asset Management Plan implemented + uploaded to NWASH MIS", weight: 1.0 },
        ],
      }],
      compute: (v, _ctx, sub) => {
        const opt = sub.inputs[0].options.find(o => o.value === v.stmt);
        return opt ? opt.weight * 100 : 0;
      },
    }],
  },

  {
    id: 7, category: "B", subcat: "Technical Operation", name: "Maintenance",
    subsets: [
      {
        id: "7.1", name: "Human resources for maintenance", type: "options", weight: 0.5,
        inputs: [{
          id: "stmt", label: "Maintenance HR statement", default: "D",
          options: [
            { value: "A", label: "A) Engineer + sub-engineer + plumber", weight: 1.0 },
            { value: "B", label: "B) Sub-engineer + plumber", weight: 0.8 },
            { value: "C", label: "C) Plumber only", weight: 0.5 },
            { value: "D", label: "D) No technical personnel", weight: 0.0 },
          ],
        }],
        compute: (v, _ctx, sub) => {
          const opt = sub.inputs[0].options.find(o => o.value === v.stmt);
          return opt ? opt.weight * 100 : 0;
        },
      },
      {
        id: "7.2", name: "Maintenance efficiency", type: "quantitative", weight: 0.5,
        inputs: [
          { id: "m_done",     label: "Maintenance/repairs actually done", unit: "no.", default: 0 },
          { id: "m_required", label: "Maintenance/repairs required", unit: "no.", default: 0 },
        ],
        compute: (v) => v.m_required ? Math.min(100, v.m_done / v.m_required * 100) : 0,
      },
    ],
  },

  {
    id: 8, category: "B", subcat: "Technical Operation", name: "Mean Time to Repair (MTTR)",
    subsets: [
      {
        id: "8.1", name: "Reserve fund availability", type: "options", weight: 0.4,
        inputs: [{
          id: "stmt", label: "Reserve fund statement", default: "A",
          options: [
            { value: "A", label: "A) No reserve fund", weight: 0.0 },
            { value: "B", label: "B) Ad-hoc fund collected when needed", weight: 0.4 },
            { value: "C", label: "C) Dedicated O&M reserve fund maintained regularly", weight: 1.0 },
          ],
        }],
        compute: (v, _ctx, sub) => {
          const opt = sub.inputs[0].options.find(o => o.value === v.stmt);
          return opt ? opt.weight * 100 : 0;
        },
      },
      {
        id: "8.2", name: "Average repair time (ART)", type: "quantitative", weight: 0.6,
        inputs: [
          { id: "art_total_hrs",  label: "Total time on all unplanned repairs (hours)", unit: "hrs", default: 0 },
          { id: "art_n_repairs",  label: "Total unplanned repairs completed (no.)", unit: "no.", default: 0 },
        ],
        compute: (v) => {
          if (!v.art_n_repairs) return 0;
          const art = v.art_total_hrs / v.art_n_repairs;
          if (art <= 24) return 100;
          if (art >= 72) return 0;
          return (72 - art) / 48 * 100;
        },
      },
    ],
  },

  {
    id: 9, category: "B", subcat: "Technical Operation", name: "Non-Revenue Water (NRW)",
    subsets: [
      {
        id: "9.1", name: "NRW management strategy", type: "options", weight: 0.4,
        inputs: [{
          id: "stmt", label: "NRW management statement", default: "A",
          options: [
            { value: "A", label: "A) No strategy; no monitoring of system losses", weight: 0.0 },
            { value: "B", label: "B) Periodic surveys of physical losses; ad-hoc fixes", weight: 0.4 },
            { value: "C", label: "C) Documented NRW reduction strategy partially implemented", weight: 0.7 },
            { value: "D", label: "D) Comprehensive NRW strategy fully implemented with tracking", weight: 1.0 },
          ],
        }],
        compute: (v, _ctx, sub) => {
          const opt = sub.inputs[0].options.find(o => o.value === v.stmt);
          return opt ? opt.weight * 100 : 0;
        },
      },
      {
        id: "9.2", name: "NRW ratio", type: "quantitative", weight: 0.6,
        inputs: [
          { id: "vol_supplied", label: "Total volume supplied into distribution (m3/yr)", unit: "m3", default: 0 },
          { id: "vol_billed_n", label: "Total volume billed to consumers (m3/yr)", unit: "m3", default: 0 },
        ],
        compute: (v) => {
          if (!v.vol_supplied) return 0;
          const nrw = (v.vol_supplied - v.vol_billed_n) / v.vol_supplied * 100;
          // Lower NRW is better. <= 20% best, >= 50% worst
          if (nrw <= 20) return 100;
          if (nrw >= 50) return 0;
          return (50 - nrw) / 30 * 100;
        },
      },
    ],
  },

  // ----- B-2 Financial Management -----
  {
    id: 10, category: "B", subcat: "Financial Management", name: "Water Tariff and Connection Charge",
    subsets: [
      {
        id: "10.1", name: "Water tariff policy", type: "options", weight: 0.4,
        inputs: [{
          id: "stmt", label: "Tariff policy statement", default: "A",
          options: [
            { value: "A", label: "A) No tariff structure; flat or none", weight: 0.0 },
            { value: "B", label: "B) Single flat tariff for all consumers", weight: 0.4 },
            { value: "C", label: "C) Volumetric tariff for metered connections", weight: 0.7 },
            { value: "D", label: "D) Block tariff with cross-subsidy and lifeline rates", weight: 1.0 },
          ],
        }],
        compute: (v, _ctx, sub) => {
          const opt = sub.inputs[0].options.find(o => o.value === v.stmt);
          return opt ? opt.weight * 100 : 0;
        },
      },
      {
        id: "10.2", name: "Water affordability", type: "quantitative", weight: 0.3,
        inputs: [
          { id: "monthly_tariff",  label: "Monthly tariff for 8 m3 (NRs)", unit: "NRs", default: 0 },
          { id: "subsidy",         label: "Monthly subsidy to low-income HH (NRs)", unit: "NRs", default: 0 },
          { id: "low_inc_monthly", label: "Avg monthly income of low-income HH (NRs)", unit: "NRs", default: 0 },
        ],
        compute: (v) => {
          if (!v.low_inc_monthly) return 0;
          const ratio = (v.monthly_tariff - v.subsidy) / v.low_inc_monthly * 100;
          if (ratio <= 2) return 100;
          if (ratio >= 5) return 0;
          return (5 - ratio) / 3 * 100;
        },
      },
      {
        id: "10.3", name: "Connection affordability", type: "quantitative", weight: 0.3,
        inputs: [
          { id: "conn_charge",   label: "New connection charge (NRs)", unit: "NRs", default: 0 },
          { id: "conn_subsidy",  label: "Connection subsidy to low-income HH (NRs)", unit: "NRs", default: 0 },
          { id: "low_inc_year",  label: "Avg yearly income of low-income HH (NRs)", unit: "NRs", default: 0 },
        ],
        compute: (v) => {
          if (!v.low_inc_year) return 0;
          const ratio = (v.conn_charge - v.conn_subsidy) / v.low_inc_year * 100;
          if (ratio <= 5) return 100;
          if (ratio >= 25) return 0;
          return (25 - ratio) / 20 * 100;
        },
      },
    ],
  },

  {
    id: 11, category: "B", subcat: "Financial Management", name: "Operating Ratio",
    subsets: [{
      id: "11.1", name: "Operating ratio", type: "quantitative", weight: 1.0,
      inputs: [
        { id: "op_revenue", label: "Total operating revenue (NRs/yr)", unit: "NRs", default: 0 },
        { id: "op_costs",   label: "Total operating costs (excl. depreciation) (NRs/yr)", unit: "NRs", default: 0 },
      ],
      compute: (v) => {
        if (!v.op_costs) return 0;
        const ratio = v.op_revenue / v.op_costs;
        if (ratio >= 1.2) return 100;
        if (ratio <= 0.5) return 0;
        return (ratio - 0.5) / 0.7 * 100;
      },
    }],
  },

  {
    id: 12, category: "B", subcat: "Financial Management", name: "Contribution to Investment (CTI)",
    subsets: [{
      id: "12.1", name: "CTI ratio", type: "quantitative", weight: 1.0,
      inputs: [
        { id: "internal_funds", label: "Internal funds for capital investment (NRs/yr)", unit: "NRs", default: 0 },
        { id: "total_capex",    label: "Total capital expenditure (NRs/yr)", unit: "NRs", default: 0 },
      ],
      compute: (v) => v.total_capex ? Math.min(100, v.internal_funds / v.total_capex * 100) : 0,
    }],
  },

  {
    id: 13, category: "B", subcat: "Financial Management", name: "Financial Accountability",
    subsets: [{
      id: "13.1", name: "Financial accountability practice", type: "options", weight: 1.0,
      inputs: [{
        id: "stmt", label: "Financial accountability statement", default: "A",
        options: [
          { value: "A", label: "A) No financial records / no audit", weight: 0.0 },
          { value: "B", label: "B) Internal records only; no external audit", weight: 0.3 },
          { value: "C", label: "C) Audited annually by authorized auditor", weight: 0.7 },
          { value: "D", label: "D) Annual audit + report disclosed to consumers/AGM + uploaded to MIS", weight: 1.0 },
        ],
      }],
      compute: (v, _ctx, sub) => {
        const opt = sub.inputs[0].options.find(o => o.value === v.stmt);
        return opt ? opt.weight * 100 : 0;
      },
    }],
  },

  // ----- B-3 Commercial Operation -----
  {
    id: 14, category: "B", subcat: "Commercial Operation", name: "Metering Ratio",
    subsets: [{
      id: "14.1", name: "Metering ratio", type: "quantitative", weight: 1.0,
      inputs: [
        { id: "n_metered",    label: "No. of working metered connections", unit: "no.", default: 0 },
        { id: "n_total_conn", label: "Total no. of connections", unit: "no.", default: 0 },
      ],
      compute: (v) => v.n_total_conn ? Math.min(100, v.n_metered / v.n_total_conn * 100) : 0,
    }],
  },

  {
    id: 15, category: "B", subcat: "Commercial Operation", name: "Billing and Collection Efficiency",
    subsets: [
      {
        id: "15.1", name: "Billing efficiency", type: "quantitative", weight: 0.4,
        inputs: [
          { id: "n_billed",   label: "No. of connections billed", unit: "no.", default: 0 },
          { id: "n_chargeable",label: "No. of connections required to pay", unit: "no.", default: 0 },
        ],
        compute: (v) => v.n_chargeable ? Math.min(100, v.n_billed / v.n_chargeable * 100) : 0,
      },
      {
        id: "15.2", name: "Collection efficiency", type: "quantitative", weight: 0.6,
        inputs: [
          { id: "amt_collected", label: "Total cash collected in year (NRs)", unit: "NRs", default: 0 },
          { id: "amt_billed",    label: "Total amount billed in year (NRs)", unit: "NRs", default: 0 },
        ],
        compute: (v) => v.amt_billed ? Math.min(100, v.amt_collected / v.amt_billed * 100) : 0,
      },
    ],
  },

  {
    id: 16, category: "B", subcat: "Commercial Operation", name: "Customer Database Management",
    subsets: [{
      id: "16.1", name: "Customer database practice", type: "options", weight: 1.0,
      inputs: [{
        id: "stmt", label: "Customer database statement", default: "A",
        options: [
          { value: "A", label: "A) No customer database", weight: 0.0 },
          { value: "B", label: "B) Manual register, partial info, irregular updates", weight: 0.4 },
          { value: "C", label: "C) Computerized DB with key info, updated annually", weight: 0.7 },
          { value: "D", label: "D) Live DB integrated with billing/MIS, near-real-time updates", weight: 1.0 },
        ],
      }],
      compute: (v, _ctx, sub) => {
        const opt = sub.inputs[0].options.find(o => o.value === v.stmt);
        return opt ? opt.weight * 100 : 0;
      },
    }],
  },

  // ----- B-4 Consumer Satisfaction -----
  {
    id: 17, category: "B", subcat: "Consumer Satisfaction", name: "Complaints Handling",
    subsets: [
      {
        id: "17.1", name: "Complaints management", type: "options", weight: 0.4,
        inputs: [{
          id: "stmt", label: "Complaint management statement", default: "A",
          options: [
            { value: "A", label: "A) No complaint mechanism", weight: 0.0 },
            { value: "B", label: "B) Verbal complaints only", weight: 0.3 },
            { value: "C", label: "C) Written register; resolved ad-hoc", weight: 0.7 },
            { value: "D", label: "D) Multi-channel complaint system with SLAs and tracking", weight: 1.0 },
          ],
        }],
        compute: (v, _ctx, sub) => {
          const opt = sub.inputs[0].options.find(o => o.value === v.stmt);
          return opt ? opt.weight * 100 : 0;
        },
      },
      {
        id: "17.2", name: "Redress effectiveness", type: "quantitative", weight: 0.6,
        inputs: [
          { id: "n_resolved", label: "Complaints resolved in year", unit: "no.", default: 0 },
          { id: "n_logged",   label: "Total complaints logged in year", unit: "no.", default: 0 },
        ],
        compute: (v) => v.n_logged ? Math.min(100, v.n_resolved / v.n_logged * 100) : 0,
      },
    ],
  },

  {
    id: 18, category: "B", subcat: "Consumer Satisfaction", name: "Consumer Satisfaction Survey",
    subsets: [{
      id: "18.1", name: "Survey practice", type: "options", weight: 1.0,
      inputs: [{
        id: "stmt", label: "Consumer satisfaction survey statement", default: "A",
        options: [
          { value: "A", label: "A) Never conducted", weight: 0.0 },
          { value: "B", label: "B) Conducted >2 years ago", weight: 0.4 },
          { value: "C", label: "C) Conducted within last 2 years", weight: 0.8 },
          { value: "D", label: "D) Annual survey with action plan based on findings", weight: 1.0 },
        ],
      }],
      compute: (v, _ctx, sub) => {
        const opt = sub.inputs[0].options.find(o => o.value === v.stmt);
        return opt ? opt.weight * 100 : 0;
      },
    }],
  },

  // ----- B-5 Organizational Management -----
  {
    id: 19, category: "B", subcat: "Organizational Management", name: "Business Plan Implementation",
    subsets: [{
      id: "19.1", name: "Business plan", type: "options", weight: 1.0,
      inputs: [{
        id: "stmt", label: "Business plan statement", default: "A",
        options: [
          { value: "A", label: "A) No business plan", weight: 0.0 },
          { value: "B", label: "B) Business plan prepared but not implemented", weight: 0.4 },
          { value: "C", label: "C) Plan partially implemented; reviewed annually", weight: 0.7 },
          { value: "D", label: "D) Plan fully implemented with annual progress review and updates", weight: 1.0 },
        ],
      }],
      compute: (v, _ctx, sub) => {
        const opt = sub.inputs[0].options.find(o => o.value === v.stmt);
        return opt ? opt.weight * 100 : 0;
      },
    }],
  },

  {
    id: 20, category: "B", subcat: "Organizational Management", name: "Human Resource Development (HRD)",
    subsets: [
      {
        id: "20.1", name: "Training need identification", type: "options", weight: 0.4,
        inputs: [{
          id: "stmt", label: "Training needs statement", default: "A",
          options: [
            { value: "A", label: "A) No training needs assessment", weight: 0.0 },
            { value: "B", label: "B) Ad-hoc identification, no document", weight: 0.4 },
            { value: "C", label: "C) Annual training plan documented", weight: 0.7 },
            { value: "D", label: "D) Annual TNA + multi-year HRD plan implemented", weight: 1.0 },
          ],
        }],
        compute: (v, _ctx, sub) => {
          const opt = sub.inputs[0].options.find(o => o.value === v.stmt);
          return opt ? opt.weight * 100 : 0;
        },
      },
      {
        id: "20.2", name: "Capacity development delivery", type: "quantitative", weight: 0.6,
        inputs: [
          { id: "tr_done",     label: "Trainings provided in year", unit: "no.", default: 0 },
          { id: "tr_planned",  label: "Trainings planned in year", unit: "no.", default: 0 },
        ],
        compute: (v) => v.tr_planned ? Math.min(100, v.tr_done / v.tr_planned * 100) : 0,
      },
    ],
  },

  {
    id: 21, category: "B", subcat: "Organizational Management", name: "Gender Equality and Social Inclusion (GESI)",
    subsets: [
      {
        id: "21.1", name: "Gender policy compliance", type: "options", weight: 0.35,
        inputs: [{
          id: "stmt", label: "Gender policy statement", default: "A",
          options: [
            { value: "A", label: "A) No gender policy", weight: 0.0 },
            { value: "B", label: "B) Gender policy adopted but not implemented", weight: 0.5 },
            { value: "C", label: "C) Gender policy implemented; women in committee", weight: 1.0 },
          ],
        }],
        compute: (v, _ctx, sub) => {
          const opt = sub.inputs[0].options.find(o => o.value === v.stmt);
          return opt ? opt.weight * 100 : 0;
        },
      },
      {
        id: "21.2", name: "Social inclusion policy compliance", type: "options", weight: 0.35,
        inputs: [{
          id: "stmt", label: "Social inclusion statement", default: "A",
          options: [
            { value: "A", label: "A) No SI policy", weight: 0.0 },
            { value: "B", label: "B) SI policy adopted but not implemented", weight: 0.5 },
            { value: "C", label: "C) SI policy implemented with marginalized representation", weight: 1.0 },
          ],
        }],
        compute: (v, _ctx, sub) => {
          const opt = sub.inputs[0].options.find(o => o.value === v.stmt);
          return opt ? opt.weight * 100 : 0;
        },
      },
      {
        id: "21.3", name: "Gender responsiveness in training", type: "quantitative", weight: 0.3,
        inputs: [
          { id: "women_trained",label: "Women staff trained in year", unit: "no.", default: 0 },
          { id: "total_trained",label: "Total staff trained in year", unit: "no.", default: 0 },
        ],
        compute: (v) => v.total_trained ? Math.min(100, v.women_trained / v.total_trained * 100) : 0,
      },
    ],
  },

  {
    id: 22, category: "B", subcat: "Organizational Management", name: "Regularity of Annual General Meeting (AGM)",
    subsets: [{
      id: "22.1", name: "AGM regularity", type: "options", weight: 1.0,
      inputs: [{
        id: "stmt", label: "AGM statement", default: "A",
        options: [
          { value: "A", label: "A) AGM not held in last 2 years", weight: 0.0 },
          { value: "B", label: "B) AGM held but irregular (>1 year delay)", weight: 0.4 },
          { value: "C", label: "C) AGM held annually but with low quorum/participation", weight: 0.7 },
          { value: "D", label: "D) AGM held annually with strong consumer participation; minutes published", weight: 1.0 },
        ],
      }],
      compute: (v, _ctx, sub) => {
        const opt = sub.inputs[0].options.find(o => o.value === v.stmt);
        return opt ? opt.weight * 100 : 0;
      },
    }],
  },

  {
    id: 23, category: "B", subcat: "Organizational Management", name: "Organizational Maturity",
    subsets: [
      {
        id: "23.1", name: "Environmental sanitation", type: "options", weight: 0.34,
        inputs: [{
          id: "stmt", label: "Environmental sanitation statement", default: "A",
          options: [
            { value: "A", label: "A) No environmental sanitation activities", weight: 0.0 },
            { value: "B", label: "B) Occasional clean-up campaigns", weight: 0.5 },
            { value: "C", label: "C) Documented environmental sanitation plan implemented", weight: 1.0 },
          ],
        }],
        compute: (v, _ctx, sub) => {
          const opt = sub.inputs[0].options.find(o => o.value === v.stmt);
          return opt ? opt.weight * 100 : 0;
        },
      },
      {
        id: "23.2", name: "Climate change adaptation", type: "options", weight: 0.33,
        inputs: [{
          id: "stmt", label: "Climate change adaptation statement", default: "A",
          options: [
            { value: "A", label: "A) No adaptation measures", weight: 0.0 },
            { value: "B", label: "B) Awareness only; no plan", weight: 0.5 },
            { value: "C", label: "C) Climate adaptation plan integrated and being implemented", weight: 1.0 },
          ],
        }],
        compute: (v, _ctx, sub) => {
          const opt = sub.inputs[0].options.find(o => o.value === v.stmt);
          return opt ? opt.weight * 100 : 0;
        },
      },
      {
        id: "23.3", name: "Strategic restructuring", type: "options", weight: 0.33,
        inputs: [{
          id: "stmt", label: "Strategic restructuring statement", default: "A",
          options: [
            { value: "A", label: "A) Static structure; no review", weight: 0.0 },
            { value: "B", label: "B) Periodic informal review of structure", weight: 0.5 },
            { value: "C", label: "C) Formal review and restructuring per service/business plan", weight: 1.0 },
          ],
        }],
        compute: (v, _ctx, sub) => {
          const opt = sub.inputs[0].options.find(o => o.value === v.stmt);
          return opt ? opt.weight * 100 : 0;
        },
      },
    ],
  },
];

// Career-path zones (X = Cat B %, Y = Cat A %).
// Drawn back-to-front so larger zones are painted first.
window.CAREER_ZONES = [
  { name: "Very Poor",           color: "#F26B5A", x: [0,30],   y: [0,30]  },
  { name: "Poor",                color: "#E76FE0", x: [0,50],   y: [0,50]  },
  { name: "Inactive",            color: "#A9A9A9", x: [0,50],   y: [50,100]},
  { name: "Active",              color: "#3F8E5C", x: [50,100], y: [0,50]  },
  { name: "Improving",           color: "#F4E84A", x: [50,70],  y: [50,75] },
  { name: "Improved",            color: "#7FE07D", x: [70,80],  y: [70,90] },
  { name: "Just Efficient",      color: "#41E0E0", x: [80,90],  y: [80,90] },
  { name: "Moderately Efficient",color: "#A8D8F0", x: [90,100], y: [90,95] },
  { name: "Highly Efficient",    color: "#5C5F66", x: [95,100], y: [95,100]},
];

// Determine which zone (X, Y) lands in (last match wins → smallest zone).
window.classifyZone = function(x, y) {
  let zone = null;
  for (const z of window.CAREER_ZONES) {
    if (x >= z.x[0] && x <= z.x[1] && y >= z.y[0] && y <= z.y[1]) zone = z;
  }
  return zone;
};
