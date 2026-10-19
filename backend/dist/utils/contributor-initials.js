"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateContributorInitials = void 0;
const generateContributorInitials = (contributors) => {
    return contributors
        .map((contributor) => {
        const name = contributor.name?.trim();
        if (!name) {
            return "";
        }
        const parts = name.split(/\s+/);
        const lastName = parts[parts.length - 1];
        return lastName.charAt(0).toUpperCase();
    })
        .filter(Boolean)
        .join("");
};
exports.generateContributorInitials = generateContributorInitials;
