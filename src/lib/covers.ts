export function getStageCover(filterTag?: string) {
  switch (filterTag) {
    case "孕早期":
      return "/images/stage-preg-early.svg";
    case "孕中期":
      return "/images/stage-preg-mid.svg";
    case "孕晚期":
      return "/images/stage-preg-late.svg";
    case "新生儿":
      return "/images/stage-newborn.svg";
    case "婴幼儿":
      return "/images/stage-toddler.svg";
    default:
      return "/images/stage-preg-early.svg";
  }
}

export function withCoverFallback(
  image: string | undefined,
  filterTag?: string,
  _opts?: { id?: string | number; title?: string },
) {
  if (image && image.trim()) return image;
  return getStageCover(filterTag);
}

