"use strict";

// Shared by the browser and classroom API: hiding a card is not sufficient
// when old records, imported files or API requests can carry royal garments.
(function (root) {
  const king = { gender: "male", roles: ["king"] };
  const rules = {
    outfit: {
      royal: king,
      emperor: king,
      myeonbok: king,
      prince: { gender: "male", roles: ["prince"] },
      noui: { gender: "female", roles: ["queen", "princess"] },
    },
    hair: {
      ikseongwan: { gender: "male", roles: ["king", "prince"] },
      myeonryugwan: king,
    },
  };
  function allows(kind, value, person) {
    if (!Object.hasOwn(rules[kind], value)) return true;
    const rule = rules[kind][value];
    return (
      person.status === "royal" &&
      person.gender === rule.gender &&
      rule.roles.includes(person.role)
    );
  }
  function repair(person) {
    const result = { ...person };
    if (!allows("outfit", result.outfit, result)) {
      result.outfit = "daily";
      result.top = "#FFFFFF";
      result.bottom = "#6A5BA8";
      result.layer = "#BD8A63";
    }
    if (!allows("hair", result.hair, result))
      result.hair = result.gender === "female" ? "jjog_meori" : "sangtu";
    return result;
  }
  const policy = Object.freeze({ allows, repair });
  if (typeof module === "object" && module.exports) module.exports = policy;
  else root.WARDROBE_POLICY = policy;
})(typeof window === "object" ? window : globalThis);
