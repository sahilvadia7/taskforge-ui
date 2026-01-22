import { Issue } from "@/features/issues/types";

export type RuleType = "RESTRICT_ROLE" | "REQUIRED_FIELD" | "BLOCKER_CHECK" | "PARENT_CHECK" | "WIP_LIMIT";

export interface WorkflowRule {
    id: string;
    type: RuleType;
    value?: string; // e.g., role name, field name, or number string for WIP
    message?: string; // Custom error message
}

export interface TransitionConfig {
    from: string;
    to: string;
    allowed: boolean;
    rules: WorkflowRule[];
}

export interface ValidationResult {
    allowed: boolean;
    reason?: string;
}

export interface ValidationContext {
    userRole: string;
    targetColumnCount?: number;
    wipLimit?: number; // Global or column specific limit passed in
}

export const validateTransition = (
    issue: Issue,
    targetStatus: string,
    transitionConfig?: TransitionConfig,
    context?: ValidationContext
): ValidationResult => {
    // 1. Check if ANY config exists for this pair. If not, default to ALLOWED.
    if (!transitionConfig) {
        // Fallback: If no strict config, maybe check global WIP limit if passed in context
        if (context?.wipLimit && context.targetColumnCount !== undefined) {
            if (context.targetColumnCount >= context.wipLimit) {
                return {
                    allowed: false,
                    reason: `Column '${targetStatus}' has reached its WIP limit of ${context.wipLimit}.`
                };
            }
        }
        return { allowed: true };
    }

    // 2. Check if explicitly blocked
    if (!transitionConfig.allowed) {
        return { allowed: false, reason: "Transition is explicitly blocked by workflow." };
    }

    // 3. Evaluate Rules
    if (transitionConfig.rules && transitionConfig.rules.length > 0) {
        for (const rule of transitionConfig.rules) {
            switch (rule.type) {
                case "RESTRICT_ROLE":
                    if (context?.userRole === "ADMIN") break;
                    if (context?.userRole !== rule.value) {
                        return {
                            allowed: false,
                            reason: rule.message || `Only users with role ${rule.value} can perform this transition.`
                        };
                    }
                    break;

                case "REQUIRED_FIELD":
                    const fieldName = rule.value as keyof Issue;
                    if (!issue[fieldName]) {
                        return {
                            allowed: false,
                            reason: rule.message || `Field '${String(fieldName)}' is required to move to ${targetStatus}.`
                        };
                    }
                    break;

                case "WIP_LIMIT":
                    const limit = parseInt(rule.value || "0", 10);
                    if (context?.targetColumnCount !== undefined && limit > 0) {
                        if (context.targetColumnCount >= limit) {
                            return {
                                allowed: false,
                                reason: rule.message || `Move prevented: '${targetStatus}' limit of ${limit} reached.`
                            };
                        }
                    }
                    break;
            }
        }
    }

    // Global context check fallback if not explicitly in rules but passed in context
    if (context?.wipLimit && context.targetColumnCount !== undefined) {
        if (context.targetColumnCount >= context.wipLimit) {
            return {
                allowed: false,
                reason: `Column '${targetStatus}' limit of ${context.wipLimit} reached.`
            };
        }
    }

    return { allowed: true };
};
