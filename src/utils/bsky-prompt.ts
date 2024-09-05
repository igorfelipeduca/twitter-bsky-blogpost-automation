export const getBskyPrompt = (subject: string, lang: string): string => {
  return `Create a casual and concise explanation of the ${subject}. It should be written in all lowercase, without line breaks or hashtags. Ensure the text is complete and readable. Write this thread in the language: ${lang}. Search the subject in the internet and provide links that the users can go and read to learn more about the theme.`;
};
