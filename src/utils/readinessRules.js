import {
  RULE_FIELDS,
  RULE_TARGET_MODULE,
} from "../constants/readinessRules.js";
import { hasValue } from "./readiness.js";

export function toBoolean(value) {
  if (typeof value === "boolean") return value;
  if (!hasValue(value)) return false;

  const normalized = String(value).trim().toLowerCase();
  return normalized === "true" || normalized === "yes" || normalized === "1";
}

export function toNumber(value) {
  if (!hasValue(value)) return 0;

  const parsed = Number.parseFloat(String(value).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function matchesTargetModule(value) {
  return (
    hasValue(value) &&
    String(value).trim().toLowerCase() === RULE_TARGET_MODULE.toLowerCase()
  );
}

/**
 * Keeps only the rules that apply to this widget -- active, required and
 * targeting Deals -- then sorts them by Display Order ascending.
 */
export function buildActiveRules(records) {
  if (!Array.isArray(records)) return [];

  return records
    .filter(
      (record) =>
        toBoolean(record?.[RULE_FIELDS.active]) &&
        toBoolean(record?.[RULE_FIELDS.required]) &&
        matchesTargetModule(record?.[RULE_FIELDS.targetModule]),
    )
    .map((record, index) => ({
      id: String(record?.id ?? `rule-${index}`),
      name: String(record?.[RULE_FIELDS.ruleName] ?? "").trim(),
      label:
        String(record?.[RULE_FIELDS.fieldLabel] ?? "").trim() ||
        String(record?.[RULE_FIELDS.fieldApiName] ?? "").trim() ||
        String(record?.[RULE_FIELDS.ruleName] ?? "").trim() ||
        "Unnamed rule",
      fieldApiName: String(record?.[RULE_FIELDS.fieldApiName] ?? "").trim(),
      missingMessage: String(
        record?.[RULE_FIELDS.missingFieldMessage] ?? "",
      ).trim(),
      weight: toNumber(record?.[RULE_FIELDS.scoreWeight]),
      displayOrder: toNumber(record?.[RULE_FIELDS.displayOrder]),
      active: true,
      required: true,
    }))
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getRulesSummary(rules) {
  const list = Array.isArray(rules) ? rules : [];
  const totalWeight = list.reduce((sum, rule) => sum + rule.weight, 0);

  return {
    activeRulesCount: list.length,
    // Trim floating-point noise from summed decimal weights.
    totalRuleWeight: Math.round(totalWeight * 100) / 100,
    targetModule: RULE_TARGET_MODULE,
  };
}
