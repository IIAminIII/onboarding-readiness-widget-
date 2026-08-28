# Easy Client Onboarding Tracker for Zoho CRM

A Zoho CRM extension that helps sales and project teams validate whether a Deal is ready for client
onboarding before the handoff process begins.

## 2. Problem statement

Client onboarding usually starts the moment a Deal is closed, but the information the delivery team
needs is often still missing from the record. There is no contact, no kickoff date, no confirmation
that required assets were received, and no agreed handoff owner.

The result is predictable: the project team chases the sales team for details, onboarding stalls
before it starts, and nobody can tell from the Deal record whether a handoff is safe to begin. The
readiness of a Deal lives in people's heads and in email threads rather than in CRM.

## 3. Solution overview

The extension makes onboarding readiness an explicit, measurable state on the Deal.

It checks required Deal information against a configurable set of rules, calculates a readiness
score, records which fields are missing, and drives the Deal through a defined onboarding lifecycle
from readiness check to completed handoff. A React-based CRM widget shows the whole picture on the
Deal detail page.

Two halves make up the extension:

- **The automation** — the readiness calculation, the four workflow buttons, and the Onboarding
  Readiness Rules module. These write to CRM.
- **The widget** — a read-only React + Vite panel that displays what the automation has saved.

This repository contains the widget. See **[WIDGET.md](WIDGET.md)** for its documentation.

## 4. Features

### 4.1 Onboarding readiness checker

Checks the active readiness rules against the Deal and calculates a readiness score. It records the
missing onboarding information — Contact Name, Amount, Next Step, Required Assets Status, Kickoff
Date, Handoff Status — so the gap is visible on the record instead of being rediscovered later.

### 4.2 Configurable readiness rules

Admins manage readiness requirements through the **Onboarding Readiness Rules** module rather than
in code. Each rule defines the target field, score weight, required status, and missing field
message, so the definition of "ready" can change per organisation without a new extension build.

### 4.3 Start Onboarding

Once a Deal is marked Ready, users can start onboarding. Onboarding status becomes `In Progress` and
handoff status becomes `Pending Sales Handoff`.

### 4.4 Create Onboarding Task

After onboarding starts, users can create a kickoff task linked to the Deal. Duplicate task creation
is prevented.

### 4.5 Complete Onboarding

Available only once the kickoff task is marked `Completed`. Onboarding status becomes `Completed`
and handoff status becomes `Project Team Assigned`.

### 4.6 Reset Onboarding

Resets the onboarding fields to their initial state for testing or correction.

### 4.7 Readiness widget

Displays readiness score, readiness level, onboarding status, missing fields, suggested action,
onboarding task status, lifecycle progress, and the active readiness rules.

### 4.8 Lifecycle progress tracker

Visually tracks the complete onboarding lifecycle: Readiness Checked → Onboarding Started → Task
Created → Task Completed → Onboarding Completed.

## 5. Modules & fields

### Deal fields

| Field API name | Purpose |
| --- | --- |
| `easyclientonboardingtracker__Onboarding_Status` | Lifecycle state: `Missing Information`, `Ready for Onboarding`, `In Progress`, `Completed` |
| `easyclientonboardingtracker__Onboarding_Readiness_Score` | Calculated score, 0–100 |
| `easyclientonboardingtracker__Onboarding_Readiness_Level` | `Ready`, `Needs Review`, `Incomplete` |
| `easyclientonboardingtracker__Missing_Onboarding_Fields` | Comma-separated list of unmet rules |
| `easyclientonboardingtracker__Required_Assets_Status` | Whether client assets have been received |
| `easyclientonboardingtracker__Kickoff_Date` | Scheduled kickoff date |
| `easyclientonboardingtracker__Handoff_Status` | `Pending Sales Handoff`, `Project Team Assigned` |
| `easyclientonboardingtracker__Onboarding_Notes` | Free-text handoff notes |
| `easyclientonboardingtracker__Last_Readiness_Check` | Timestamp of the last calculation |

### Onboarding Readiness Rules module

Module API name: `easyclientonboardingtracker__Onboarding_Readiness_Rules`

| Field API name | Purpose |
| --- | --- |
| `easyclientonboardingtracker__Rule_Name` | Admin-facing rule name |
| `easyclientonboardingtracker__Target_Module` | Module the rule applies to (`Deals`) |
| `easyclientonboardingtracker__Field_API_Name` | Deal field the rule checks |
| `easyclientonboardingtracker__Field_Label` | Label shown in the widget |
| `easyclientonboardingtracker__Score_Weight` | Contribution to the readiness score |
| `easyclientonboardingtracker__Required` | Whether the rule is mandatory |
| `easyclientonboardingtracker__Active` | Whether the rule is evaluated |
| `easyclientonboardingtracker__Missing_Field_Message` | Message recorded when the field is empty |
| `easyclientonboardingtracker__Display_Order` | Sort order in the widget |

### Related task

The kickoff task is a standard CRM **Task** related to the Deal with the subject
`Client onboarding kickoff`. The widget matches on that subject, case-insensitively.

## 6. Buttons & logic

All four workflow buttons and the readiness check live in the extension, not in the widget.

| Button | Precondition | Effect |
| --- | --- | --- |
| Check Onboarding Readiness | none | Evaluates active rules; writes score, level, missing fields, last-check timestamp, and sets status to `Ready for Onboarding` or `Missing Information` |
| Start Onboarding | Deal is Ready | Status → `In Progress`, handoff → `Pending Sales Handoff` |
| Create Onboarding Task | Onboarding started | Creates the `Client onboarding kickoff` task on the Deal; refuses if one already exists |
| Complete Onboarding | Kickoff task `Completed` | Status → `Completed`, handoff → `Project Team Assigned` |
| Reset Onboarding | none | Clears onboarding fields back to the initial state |

The guard conditions are what make the workflow trustworthy: onboarding cannot be completed while
the kickoff task is still open, and a second kickoff task cannot be created by accident.

## 7. Widget overview

A React + Vite panel on the Deal detail page, built on the Zoho Embedded App SDK. It reads the
current Deal from `PageLoad`, its related Tasks, and the readiness rules module, then renders:

- **Readiness overview** — score circle, readiness level badge, onboarding status, and a headline
  and suggested action driven by the current lifecycle state
- **Summary tiles** — readiness score, readiness level, onboarding status
- **Lifecycle tracker** — the five-step stepper, horizontal on desktop, stacked below 760px
- **Missing fields** — one pill per unmet rule
- **Suggested action** — the next step for the current state
- **Onboarding details** — required assets, kickoff date, handoff status, last readiness check, notes
- **Onboarding task** — Created / Completed / Not Created, with due date, priority, status, owner
- **Readiness rules** — active rule count, total weight, target module, and the rule list

The widget is strictly **read-only**. It calls `getRecord`, `getRelatedRecords`, and
`getAllRecords`, and never creates, updates, or deletes a record. **Refresh** re-fetches the Deal,
the related Tasks, and the rules. Each data source handles its own errors, so a failure in one
section never blanks the rest of the panel.

Full documentation: **[WIDGET.md](WIDGET.md)**.

## 8. Admin setup

1. Install the extension in Zoho CRM. It provisions the Deal fields, the Onboarding Readiness Rules
   module, and the workflow buttons listed above.
2. Open the **Onboarding Readiness Rules** module and create one record per requirement. Set
   `Target_Module` to `Deals`, tick `Active` and `Required`, and give each rule a `Score_Weight`
   and a `Display_Order`. Weights across the active rules should total 100 for a 0–100 score.
3. Confirm the widget is configured on the Deals detail page. For local development, point the
   widget URL at the Vite dev server; for release, upload the built ZIP.
4. Grant the profiles that will use onboarding read access to the rules module and edit access to
   the onboarding Deal fields.
5. Open a Deal and run **Check Onboarding Readiness** to confirm the rules evaluate as expected.

Field and module API names are namespaced with `easyclientonboardingtracker__`. If a module was
registered under a different namespace, the widget resolves the real name at runtime and logs a
warning naming both — see the Readiness rules section of [WIDGET.md](WIDGET.md).

## 9. User workflow

1. **Check readiness.** On a Deal nearing close, run Check Onboarding Readiness. The widget shows
   the score, the level, and any missing fields.
2. **Fill the gaps.** Complete the fields listed under Missing Fields and re-run the check until the
   Deal reaches `Ready for Onboarding`.
3. **Start onboarding.** Click Start Onboarding. Status moves to `In Progress` and handoff to
   `Pending Sales Handoff`. The lifecycle tracker advances to Task Created.
4. **Create the kickoff task.** Click Create Onboarding Task. The Onboarding Task card switches from
   Not Created to Created and shows the due date, priority, status, and owner.
5. **Run the kickoff.** The task owner completes the kickoff and marks the task `Completed`. The
   task card turns green and the tracker advances to Onboarding Completed.
6. **Complete onboarding.** Click Complete Onboarding. Status becomes `Completed`, handoff becomes
   `Project Team Assigned`, and the widget shows the green completed state with all five lifecycle
   steps done.

If the Deal is marked Completed while the kickoff task is missing or still open, the tracker shows a
lifecycle mismatch warning rather than reporting steps as done that never happened.

## 10. Testing summary

Verified in this repository:

- **Lifecycle states** — all five onboarding statuses render the correct headline, badge, colour,
  and suggested action, and an unrecognised status falls back to readiness-level behaviour.
- **Lifecycle steps** — the seven scenarios from new Deal through completed onboarding produce the
  expected completed/current/pending pattern, with exactly one current step and none once
  onboarding is completed.
- **Mismatch warning** — fires for a Completed Deal with no task, a `Not Started` task, and an
  `In Progress` task; stays silent when the task is completed and when onboarding is not completed.
- **Rules filtering** — inactive, non-required, and non-Deals rules are excluded; the remainder sort
  by `Display_Order`; boolean and numeric strings coerce correctly; a missing label falls back to
  the field API name.
- **Render states** — every section renders without error in its loading, error, empty, and
  populated states, with and without the Zoho SDK present.
- **Build** — `npm run lint` passes with zero warnings and `npm run build` succeeds.

Not covered here: end-to-end testing of the buttons and the readiness calculation, which live in the
extension package outside this repository.

## 11. Tech stack

| Layer | Technology |
| --- | --- |
| UI | React 19 |
| Build | Vite 7, ES2018 target, relative asset paths |
| CRM integration | Zoho CRM Embedded App SDK 1.1 (`getRecord`, `getRelatedRecords`, `getAllRecords`, `META.getModules`) |
| Styling | Plain CSS, no UI framework |
| Quality | ESLint 9 with React Hooks and React Refresh plugins |
| Platform | Zoho CRM extension (Sigma), custom module + custom Deal fields + workflow buttons |

## 12. Portfolio summary

Easy Client Onboarding Tracker turns an informal, error-prone handoff into a governed workflow
inside Zoho CRM. It replaces "is this Deal ready?" — a question usually answered by email — with a
scored, rule-driven state on the record itself.

The work spans the full extension surface: a configurable rules module so admins define readiness
without code, guarded workflow buttons that enforce a valid lifecycle order, and a React widget that
makes the whole state legible at a glance.

Two design decisions are worth calling out. The widget is deliberately **read-only** — every write
goes through the extension's buttons, so there is exactly one path that can change a Deal's
onboarding state. And the lifecycle tracker is **evidence-based**: a Deal marked Completed does not
back-fill the task steps, it raises a mismatch warning instead. The tracker reports what actually
happened rather than what the status claims, which is what makes it useful for spotting broken
handoffs.
