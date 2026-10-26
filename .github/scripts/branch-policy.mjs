export function isAllowedBranch(name) {
  return name === "main" || name === "staging" || /^dev-[^/]+$/.test(name);
}

export function validatePromotion({ base, head, sameRepository }) {
  if (!isAllowedBranch(base) || !isAllowedBranch(head)) {
    throw new Error("Branches must be dev-*, staging, or main.");
  }
  if (!sameRepository) {
    throw new Error("Promotion must come from a branch in bolablg/iyanju.");
  }
  if (base === "staging" && !/^dev-[^/]+$/.test(head)) {
    throw new Error("Only dev-* branches may be promoted to staging.");
  }
  if (base === "main" && head !== "staging") {
    throw new Error(
      "Only staging may be promoted to main. Do not skip staging.",
    );
  }
  if (base === head) {
    throw new Error("The source and target branches must differ.");
  }
}
