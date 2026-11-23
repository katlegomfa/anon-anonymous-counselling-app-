# GABS impact reporting — publication and governance procedure

## Public information currently shown

The Anon public impact page summarises the three programme areas and guiding values stated in the **GABS-Public-Organisation-Profile**.

That public edition explicitly states that it intentionally excludes detailed numerical impact tables, personal staff contact details and banking/payment instructions. Anon therefore does not publish detailed GABS session, reach, beneficiary or outcome figures.

The current public dataset at `public/data/gabs-impact.json` contains only the three public programme descriptions, a publication-status field and a disclosure note. It contains no programme performance totals.

## Requirement before publishing numerical figures

GABS must provide explicit written authorisation for public release and an approved, dated aggregate dataset. The permission should identify:
1. The exact dataset and reporting period authorised for publication.
2. The programme owner and reviewer responsible for the figures.
3. The definitions of activity, session, attendance, reach, participant and unique beneficiary.
4. How repeat participation and overlap between activities are treated.
5. Any restrictions on programme, age, location or demographic breakdowns.
6. The approval date and version or document reference.

A detailed source document being available to the project team does not itself authorise reproduction on a public website. GABS's public edition's deliberate exclusion of impact tables must be respected.

## Data quality requirements

Every approved update should state its reporting-period start and end dates, metric definitions, denominators, counting method, source document and page, owner role, reviewer role, and approval for public release.

Do not add activity-level reach values together or label them as unique beneficiaries unless GABS supplies a validated deduplication method and approves that definition. Do not infer programme outcomes or effectiveness from activity counts alone.

National or community challenge statistics must be separately sourced to their original publications, with reference dates and definitions, before being presented as national evidence.

## Privacy and disclosure rules

Never place personal or case-level information in the public dataset or update template, including names, telephone numbers, addresses, beneficiary/client identifiers, HIV status, diagnoses, counselling notes, safeguarding disclosures, or free-text case narratives.

GABS must review re-identification risk and approve small-cell suppression, demographic disaggregation and publication scope before any numerical data are added.

The CSV template at `docs/templates/gabs-impact-data-template.csv` is an aggregate-only planning tool. Keep source registers and beneficiary-level records in GABS-approved internal systems, not in this repository.

## Update workflow

1. Obtain written GABS approval for public release of the specific aggregate dataset.
2. Obtain the dated aggregate dataset directly from the responsible GABS programme data owner.
3. Complete the template with definitions, period, source and approval details; do not guess blank fields.
4. Have the programme owner and designated reviewer verify the data and disclosure risks.
5. Replace the safe public summary JSON only after approval has been recorded.
6. Update the impact page, tests and this governance document in a reviewed GitHub commit.
7. Run `npm test`, inspect the page on phone, tablet and desktop, verify the public JSON response and confirm the Render deployment commit.
8. Retain previous authorised versions for audit and change tracking; do not backdate or silently change reporting periods.

## System boundary

The current dashboard is a public, read-only programme summary. It is not a GABS administrator portal, beneficiary register, case-management system, clinical database or authenticated data-entry workflow. Any future private reporting portal requires GABS-approved roles, authentication, access controls, audit logging, retention rules and a separate privacy/security review before implementation.
