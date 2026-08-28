import { READINESS_RULES_MODULE } from "../constants/readinessRules.js";

const DEALS_MODULE = "Deals";
const TASKS_RELATED_LIST = "Tasks";

export function getZohoSdk() {
  return window.ZOHO;
}

export function normalizeRecordId(entityId) {
  if (Array.isArray(entityId)) {
    return entityId[0] ? String(entityId[0]) : "";
  }

  return entityId ? String(entityId) : "";
}

export async function getDealRecord(dealId) {
  const zoho = getZohoSdk();

  if (!zoho?.CRM?.API?.getRecord) {
    throw new Error("Zoho CRM SDK is unavailable.");
  }

  const response = await zoho.CRM.API.getRecord({
    Entity: DEALS_MODULE,
    RecordID: dealId,
  });

  console.log("Onboarding Readiness CRM API response:", response);

  const deal = response?.data?.[0];
  if (!deal) {
    throw new Error("The Deal record could not be loaded.");
  }

  return deal;
}

export async function getRelatedTasks(dealId) {
  const zoho = getZohoSdk();

  if (!zoho?.CRM?.API?.getRelatedRecords) {
    throw new Error("Zoho CRM SDK cannot read related records.");
  }

  const response = await zoho.CRM.API.getRelatedRecords({
    Entity: DEALS_MODULE,
    RecordID: dealId,
    RelatedList: TASKS_RELATED_LIST,
  });

  console.log("Onboarding Task related records response:", response);

  // Zoho answers with 204 (no content) when the related list is empty.
  const tasks = response?.data;
  return Array.isArray(tasks) ? tasks : [];
}

let resolvedRulesModule = "";

/**
 * The configured module API name is a best guess: an extension module can be
 * registered under a different namespace or a slightly different name, and
 * Zoho then answers getAllRecords with INVALID_MODULE ("the module name given
 * seems to be invalid"). Ask the CRM which modules exist and match by name.
 */
async function resolveRulesModule() {
  if (resolvedRulesModule) return resolvedRulesModule;

  const zoho = getZohoSdk();
  const getModules = zoho?.CRM?.META?.getModules;

  if (typeof getModules !== "function") {
    return READINESS_RULES_MODULE;
  }

  const response = await getModules();
  const modules = Array.isArray(response?.modules) ? response.modules : [];
  const apiNames = modules
    .map((module) => String(module?.api_name ?? "").trim())
    .filter(Boolean);

  const suffix = READINESS_RULES_MODULE.split("__").pop().toLowerCase();
  const match =
    apiNames.find((name) => name === READINESS_RULES_MODULE) ||
    apiNames.find((name) => name.toLowerCase().endsWith(suffix)) ||
    apiNames.find((name) =>
      name.toLowerCase().replace(/_/g, "").includes("readinessrules"),
    );

  if (!match) {
    console.warn(
      "Onboarding Readiness rules module not found. Available modules:",
      apiNames,
    );
    throw new Error(
      `The rules module "${READINESS_RULES_MODULE}" does not exist in this Zoho CRM org. Check the module API name in Setup > Modules.`,
    );
  }

  if (match !== READINESS_RULES_MODULE) {
    console.warn(
      `Onboarding Readiness rules module resolved to "${match}" instead of the configured "${READINESS_RULES_MODULE}".`,
    );
  }

  resolvedRulesModule = match;
  return match;
}

export async function getReadinessRules() {
  const zoho = getZohoSdk();

  if (!zoho?.CRM?.API?.getAllRecords) {
    throw new Error("Zoho CRM SDK cannot read the readiness rules module.");
  }

  const entity = await resolveRulesModule();
  const response = await zoho.CRM.API.getAllRecords({ Entity: entity });

  console.log(`Onboarding Readiness rules response (${entity}):`, response);

  // Zoho answers with 204 (no content) when the module holds no records.
  const rules = response?.data;
  return Array.isArray(rules) ? rules : [];
}
