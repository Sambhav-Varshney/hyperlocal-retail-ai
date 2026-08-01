export function getProductFamilyKey(product) {
  if (!product) return "";
  const name = typeof product === "string" ? product : (product.productName || product.name || "");
  const normalized = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .replace(/\b(\d+g|\d+kg|\d+ml|\d+l|pack|of|\d+s|\d+gm)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return "";

  const words = normalized.split(" ").filter(Boolean);
  if (!words.length) return "";

  // Core brand anchors & generic family extractors
  const firstWord = words[0];
  if (firstWord.includes("maggi")) return "maggi";
  if (firstWord.includes("parle")) return "parle-g";
  if (firstWord.includes("yippee")) return "yippee";
  if (firstWord.includes("top") && words[1]?.includes("ramen")) return "top ramen";
  if (firstWord.includes("coca") || firstWord.includes("coke")) return "coca-cola";
  if (firstWord.includes("pepsi")) return "pepsi";
  if (firstWord.includes("sprite")) return "sprite";
  if (firstWord.includes("thums")) return "thums up";
  if (firstWord.includes("oreo")) return "oreo";
  if (firstWord.includes("kitkat") || firstWord.includes("kit")) return "kitkat";
  if (firstWord.includes("dairy") && words[1]?.includes("milk")) return "dairy milk";
  if (firstWord.includes("amul")) return `amul ${words[1] || ""}`.trim();
  if (firstWord.includes("mother") && words[1]?.includes("dairy")) return "mother dairy";
  if (firstWord.includes("surf")) return "surf excel";
  if (firstWord.includes("ariel")) return "ariel";
  if (firstWord.includes("colgate")) return "colgate";
  if (firstWord.includes("dettol")) return "dettol";
  if (firstWord.includes("dove")) return "dove";

  return words.slice(0, 2).join(" ");
}

export function isSameProductFamily(itemA, itemB) {
  if (!itemA || !itemB) return false;
  const keyA = getProductFamilyKey(itemA);
  const keyB = getProductFamilyKey(itemB);
  if (!keyA || !keyB) return false;

  return keyA === keyB || keyA.includes(keyB) || keyB.includes(keyA);
}

export function getProductDisplayName(product) {
  if (!product) return "Product";
  const name = typeof product === "string" ? product : (product.productName || product.name || "");
  const familyKey = getProductFamilyKey(product);

  if (!familyKey) return name || "Product";

  return familyKey
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
