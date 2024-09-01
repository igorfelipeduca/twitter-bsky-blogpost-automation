export function createBskyThread(text: string): string[] {
  const maxLength = 280 - 2;
  const words = text.split(" ");
  const threadParts: string[] = [];

  let currentPart = "";

  for (const word of words) {
    if ((currentPart + word + " +").length > maxLength) {
      threadParts.push(currentPart.trim() + " +");
      currentPart = word + " ";
    } else {
      currentPart += word + " ";
    }
  }

  if (currentPart.trim().length > 0) {
    threadParts.push(currentPart.trim() + " +");
  }

  threadParts[threadParts.length - 1] = threadParts[
    threadParts.length - 1
  ].replace(/ \+$/, "");

  return threadParts;
}
