export function splitParagraph(source: string, part: string) {
  // If the part is included in the source
  if (source.includes(part)) {
    // We split the text in two
    const leftovers = source.split(part);

    // We list all the parts
    const parts = [leftovers[0], part, leftovers[1]]
      // And we filter them
      .filter((part) => part != "");

    return parts;
  }
  // If not we do nothing
  else {
    throw "Text not matching: split not possible";
  }
}
