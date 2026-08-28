# Onboarding Readiness Widget

The React + Vite widget for the **Easy Client Onboarding Tracker** Zoho CRM extension. See
[README.md](README.md) for the extension overview.

It runs on the Zoho CRM **Deals** record-detail page and uses the Zoho Embedded App SDK to load the
current Deal, its related Tasks, and the active readiness rules. The widget is **read-only**: it
calls `getRecord`, `getRelatedRecords`, and `getAllRecords`, and never creates, updates, or deletes
a CRM record.

## Zoho CRM fields

The widget reads these Deal field API names:

- `easyclientonboardingtracker__Onboarding_Status`
- `easyclientonboardingtracker__Onboarding_Readiness_Score`
- `easyclientonboardingtracker__Onboarding_Readiness_Level`
- `easyclientonboardingtracker__Missing_Onboarding_Fields`
- `easyclientonboardingtracker__Required_Assets_Status`
- `easyclientonboardingtracker__Kickoff_Date`
- `easyclientonboardingtracker__Handoff_Status`
- `easyclientonboardingtracker__Onboarding_Notes`
- `easyclientonboardingtracker__Last_Readiness_Check`

`Missing_Onboarding_Fields` is treated as a comma-separated list. Empty values are shown as **No missing fields**.

## Onboarding lifecycle states

`Onboarding_Status` drives the headline, badge, colour and suggested action of the main card:

| Onboarding Status | Title | Suggested action |
| --- | --- | --- |
| `Completed` | Onboarding Completed | Onboarding is completed and the project team has been assigned. |
| `In Progress` | Onboarding In Progress | Complete the kickoff task, then click Complete Onboarding. |
| `Ready for Onboarding` | Ready for Onboarding | Click Start Onboarding to begin the handoff process. |
| `Missing Information` | Missing Information | The existing incomplete / missing-field message. |
| no readiness check yet | Readiness check required | Click Check Onboarding Readiness to calculate the onboarding score. |

`Completed` also gives the main card green success styling. When `Handoff_Status` is
`Project Team Assigned`, it is shown as a success chip on the main card and as a green
detail tile in Onboarding Details. Any status the widget does not recognise falls back to
the previous readiness-level behaviour.

## Onboarding lifecycle tracker

A five-step stepper is rendered between the readiness overview and the missing-fields section.
It is derived purely from the Deal and related-Task data already held in state, so it costs no
extra CRM calls and refreshes with the **Refresh** button.

| Step | Completed when |
| --- | --- |
| Readiness Checked | `Onboarding_Readiness_Level` or `Onboarding_Readiness_Score` is not empty |
| Onboarding Started | `Onboarding_Status` is `In Progress` or `Completed` |
| Task Created | the `Client onboarding kickoff` task exists |
| Task Completed | that task exists and its `Status` is `Completed` |
| Onboarding Completed | `Onboarding_Status` is `Completed` |

Step completion is evidence-based: a `Completed` onboarding status never back-fills Task Created
or Task Completed. When onboarding is marked `Completed` but the kickoff task is missing or still
open, the tracker shows a soft warning banner instead:

> Lifecycle mismatch detected: Onboarding is marked Completed, but the kickoff task is missing or not completed.

The banner is suppressed while the related-Task fetch is loading or has failed, since a task that
could not be read is not evidence that it is missing.

Exactly one step carries the orange **Current** badge, and none once onboarding is completed.
The stepper is horizontal on desktop and stacks into a vertical timeline below 760px.

## Onboarding Task

The widget also reads the Deal's **Tasks** related list through
`ZOHO.CRM.API.getRelatedRecords({ Entity: "Deals", RecordID: dealId, RelatedList: "Tasks" })`
and looks for a task whose `Subject` is `Client onboarding kickoff` (matched case-insensitively).

- **Completed** — task `Status` is `Completed`; the card uses green success styling.
- **Created** — task exists with `Not Started`, `In Progress`, or any other status; neutral / orange styling.
- **Not Created** — no matching task; shows a warning with the reason and the suggested next action.

The Created and Completed states show the Subject, `Due_Date`, `Priority`, `Status`, and `Owner`
when the owner is present.

This section is read-only. The widget never creates or updates Tasks. A failed or empty related-list
call is reported inside the Onboarding Task card only, so the readiness UI keeps rendering.

## Readiness rules

The widget reads the admin rule module with `ZOHO.CRM.API.getAllRecords` and displays the rules
that drive the score. It never evaluates or recalculates the score itself -- the readiness values
shown elsewhere are the saved CRM values.

The configured module API name is `easyclientonboardingtracker__Onboarding_Readiness_Rules`. Because
an extension module can be registered under a different namespace, the widget first resolves the
real name through `ZOHO.CRM.META.getModules()`, matching the configured name exactly, then any
module ending in `Onboarding_Readiness_Rules`, then any name normalising to "readinessrules". A
resolved name that differs from the configured one is logged as a warning; if nothing matches, the
available module API names are logged and the card explains that the module was not found.

Rule field API names:

- `easyclientonboardingtracker__Active`
- `easyclientonboardingtracker__Required`
- `easyclientonboardingtracker__Target_Module`
- `easyclientonboardingtracker__Field_API_Name`
- `easyclientonboardingtracker__Field_Label`
- `easyclientonboardingtracker__Missing_Field_Message`
- `easyclientonboardingtracker__Score_Weight`
- `easyclientonboardingtracker__Display_Order`
- `easyclientonboardingtracker__Rule_Name`

Rules are kept when `Active` and `Required` are true and `Target_Module` is `Deals`, then sorted by
`Display_Order` ascending. Booleans are accepted as real booleans or as `"true"` / `"yes"` / `"1"`,
and the module match is case-insensitive. The section shows **Active Rules**, **Total Weight**
(the sum of `Score_Weight`) and **Target Module**, followed by one row per rule with its
`Field_Label` (falling back to `Field_API_Name`, then `Rule_Name`), its weight, and Required /
Active badges. With no matching rules it shows *No active readiness rules found.*

## Test from a Deal record

1. Install dependencies with `npm install`.
2. Start Vite with `npm run dev`.
3. Configure a Zoho CRM widget for the Deals module using the Vite URL (normally `http://localhost:5173`). The page must be served over a URL Zoho CRM can access and permit in its widget configuration.
4. Open an existing Deal record and launch the widget.
5. Confirm the browser console contains the `PageLoad` data, the CRM API response, the related-task response, the matched onboarding task, and the readiness rules response.
6. Use **Refresh** to fetch the current Deal values, the related Tasks, and the readiness rules again.

The widget intentionally shows an error when opened outside a Deal record. It also requires the Zoho SDK, so opening the Vite URL directly in a normal browser displays the SDK-unavailable state.

## Build

```bash
npm install
npm run lint
npm run build
```

Vite creates the production output in `dist/`. The configuration uses relative asset paths so the static build works when packaged as a widget.

## Deploy to Vercel

The widget is a static build, so Vercel hosts it with no server-side configuration.
[vercel.json](vercel.json) pins the framework, build command, and output directory.

```bash
npx vercel login      # one-time, opens a browser
npx vercel            # preview deployment
npx vercel --prod     # production deployment
```

The first `npx vercel` run asks which scope to deploy under and whether to link a new project;
accept the detected Vite settings. It prints the deployment URL when it finishes.

Then point Zoho CRM at that URL:

1. **Setup > Developer Space > Widgets**, edit the Onboarding Readiness widget.
2. Set **Hosting** to *External* and **Base URL** to the Vercel production URL, for example
   `https://onboarding-readiness-widget.vercel.app/index.html`.
3. Save, reload a Deal record, and confirm the widget renders.

Notes:

- Vercel serves the page without an `X-Frame-Options` header, so Zoho can embed it in the widget
  iframe. If you later add a `Content-Security-Policy` with `frame-ancestors`, it must include your
  Zoho data-centre domain (`https://crm.zoho.com`, `https://crm.zoho.eu`, `https://crm.zoho.in`,
  and so on) or the widget panel will render blank.
- The build already uses relative asset paths and strips `crossorigin` from the entry script, both
  of which are required for the widget to load inside the CRM iframe.
- Redeploy after every change: Zoho loads the widget fresh from the base URL, so `npx vercel --prod`
  is all that is needed. No ZIP upload is involved when hosting externally.

## Package for Zoho CRM

After `npm run build`, zip the **contents inside `dist/`**, including `index.html` and the `assets/` directory. Keep `index.html` at the root of the ZIP; do not zip the parent project folder or place an extra `dist` directory level inside the archive.

For an externally hosted widget, deploy the contents of `dist/` to the configured HTTPS base URL
instead of uploading the ZIP. See **Deploy to Vercel** above for the hosted route.
