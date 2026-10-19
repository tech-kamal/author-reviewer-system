type Contributor = {
  name?: string;
};

export const generateContributorInitials = (
  contributors: Contributor[]
): string => {
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