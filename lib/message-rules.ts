export const MESSAGE_MAX_LENGTH = 140;

const blockedPhrases = [
  "anal",
  "asshole",
  "bastard",
  "bitch",
  "blowjob",
  "chink",
  "cock",
  "cunt",
  "cum",
  "damn god",
  "dick",
  "dyke",
  "fag",
  "faggot",
  "god damn",
  "go kill yourself",
  "go to hell",
  "gook",
  "hate you",
  "heil hitler",
  "jesus christ",
  "jizz",
  "kike",
  "kill yourself",
  "kkk",
  "motherfucker",
  "nazi",
  "nigga",
  "nigger",
  "porn",
  "pussy",
  "rape",
  "retard",
  "slut",
  "holy shit",
  "fuck",
  "shit",
  "whore",
  "you should die",
];

type MessageValidationResult =
  | {
      message: string;
      ok: false;
    }
  | {
      body: string;
      ok: true;
    };

function normalizeForModeration(body: string) {
  return body
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeMessage(body: string) {
  return body.trim().replace(/\s+/g, " ").slice(0, MESSAGE_MAX_LENGTH);
}

export function validateMessage(body: string): MessageValidationResult {
  const normalizedBody = normalizeMessage(body);

  if (!normalizedBody) {
    return {
      message: "Write a message first.",
      ok: false,
    };
  }

  if (normalizedBody.length > MESSAGE_MAX_LENGTH) {
    return {
      message: `Keep it to ${MESSAGE_MAX_LENGTH} characters.`,
      ok: false,
    };
  }

  const moderationBody = normalizeForModeration(normalizedBody);
  const hasBlockedPhrase = blockedPhrases.some((phrase) =>
    moderationBody.includes(phrase),
  );

  if (hasBlockedPhrase) {
    return {
      message: "Keep it kind and respectful.",
      ok: false,
    };
  }

  return {
    body: normalizedBody,
    ok: true,
  };
}
