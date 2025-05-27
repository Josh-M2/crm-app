import { v4 as uuidv4 } from "uuid";

export function generateUniqueName(name: string) {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_${uuidv4()}`;
}

// const mommy = generateUniqueName("kathleen");
// console.log(`I love you ${mommy}`);
