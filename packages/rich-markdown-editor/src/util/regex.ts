export const hexColorRegex = /^#[0-9a-f]{3,6}$/i;

export const extractUUIDAndText = (inputString: string) => {
  const patternWithReplace =
    /([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})\(([^)]+)\)/;
  const patternWithoutReplace =
    /([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/;

  const matchWithReplace = inputString.match(patternWithReplace);
  const matchWithoutReplace = inputString.match(patternWithoutReplace);

  if (matchWithReplace) {
    const uuid = matchWithReplace[1];
    const remainingText = matchWithReplace[2];
    return {
      uuid: uuid,
      remainingText: remainingText,
    };
  } else if (matchWithoutReplace) {
    const uuid = matchWithoutReplace[1];
    return {
      uuid: uuid,
      remainingText: "",
    };
  }
  return null;
};

export const extractOriginalText = (inputString: string): string => {
  return inputString.slice(
    inputString.indexOf("~~") + 2,
    inputString.lastIndexOf("~~")
  );
};

export const parseMarkdown = (inputString: string): string => {
  const specialChar = "¤";

  let formattedText = inputString.replace(/\\/g, specialChar);
  formattedText = formattedText.replace(
    new RegExp(specialChar + specialChar, "g"),
    "\\"
  );
  formattedText = formattedText.replace(new RegExp(specialChar, "g"), "");

  return formattedText;
};
