
export const classNames = (
  ...classes: (string | string[] | { [key: string]: boolean })[]
): string => {
  return classes
    .filter(Boolean)
    .flatMap((cls) => {
      if (typeof cls === "string") {
        return cls.trim().split(/\s+/);
      } else if (Array.isArray(cls)) {
        return classNames(...cls);
      } else if (typeof cls === "object") {
        return Object.entries(cls)
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          .filter(([_, value]) => value)
          .map(([key]) => key);
      } else {
        return [];
      }
    })
    .join(" ");
};
