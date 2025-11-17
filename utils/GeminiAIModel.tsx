import { GoogleGenAI } from "@google/genai";

const apiKey =
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set");
}

const defaultModel =
  process.env.NEXT_PUBLIC_GEMINI_MODEL?.trim() ||
  process.env.GEMINI_MODEL?.trim() ||
  "gemini-2.5-flash";

const additionalModels =
  process.env.NEXT_PUBLIC_GEMINI_MODELS ??
  process.env.GEMINI_MODELS ??
  "";

const client = new GoogleGenAI({ apiKey });

const resolveModel = (model?: string) =>
  model?.trim() || defaultModel;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const DEFAULT_RETRY_ATTEMPTS = 1;
const RETRY_DELAY_MS = 600;

const extractText = async (response: any): Promise<string> => {
  const maybeText: any = response?.text;
  const resolvedText =
    typeof maybeText === "function" ? maybeText.call(response) : maybeText;

  const textValue =
    resolvedText && typeof resolvedText.then === "function"
      ? await resolvedText
      : resolvedText;

  if (!textValue) {
    throw new Error("Empty response from Gemini API");
  }
  return textValue;
};

const shouldRetry = (error: any) => {
  const message = error?.message ?? String(error);
  const normalized = message.toLowerCase();
  if (normalized.includes("quota") || normalized.includes("429")) {
    return false;
  }

  try {
    const parsed =
      typeof message === "string" ? JSON.parse(message) : error?.response;
    const code = parsed?.error?.code ?? error?.code;
    const status =
      (parsed?.error?.status as string | undefined)?.toUpperCase() ??
      (error?.status as string | undefined)?.toUpperCase();
    return code === 503 || status === "UNAVAILABLE";
  } catch {
    return normalized.includes("unavailable") || normalized.includes("overloaded");
  }
};

const MODEL_OVERLOADED = "MODEL_OVERLOADED";

const normalizeError = (error: any) => {
  const message = error?.message ?? String(error);
  if (message.toLowerCase().includes("quota") || message.includes("429")) {
    return new Error("API_QUOTA_EXCEEDED");
  }
  try {
    const parsed =
      typeof message === "string" ? JSON.parse(message) : error?.response;
    if (parsed?.error) {
      const { code, message: errMessage, status } = parsed.error;
      if (code === 503 || (status ?? "").toUpperCase() === "UNAVAILABLE") {
        return new Error(MODEL_OVERLOADED);
      }
      return new Error(errMessage ?? message);
    }
  } catch {
    // ignore parse issues
  }
  const normalized = message.toLowerCase();
  if (normalized.includes("unavailable") || normalized.includes("overloaded")) {
    return new Error(MODEL_OVERLOADED);
  }
  return error instanceof Error ? error : new Error(message);
};

const uniqueModels = (...models: Array<string | undefined>) =>
  Array.from(
    new Set(
      models
        .flatMap((m) =>
          (m ?? "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        )
    )
  );

const fallbackModels = [
  "gemini-2.5-flash-lite",
  "gemini-1.5-flash",
  "gemini-1.5-flash-lite"
];
  
const getModelCandidates = (requested?: string) =>
  uniqueModels(
    requested,
    requested ? undefined : resolveModel(),
    additionalModels,
    fallbackModels.join(",")
  );

// Helper function to generate content with the Gemini SDK
export const generateContent = async (
  prompt: string,
  model?: string,
  attempts: number = DEFAULT_RETRY_ATTEMPTS
) => {
  const candidates = getModelCandidates(model);

  let lastError: Error | null = null;

  for (const candidate of candidates) {
    let remainingAttempts = attempts;

    while (remainingAttempts >= 0) {
      try {
        const response = await client.models.generateContent({
          model: candidate,
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ]
        });

        return await extractText(response);
      } catch (error: any) {
        const normalizedError = normalizeError(error);
        lastError = normalizedError;

        if (remainingAttempts > 0 && shouldRetry(error)) {
          remainingAttempts -= 1;
          await sleep(RETRY_DELAY_MS);
          continue;
        }
        break;
      }
    }
  }

  const errorToThrow =
    lastError ??
    new Error("Failed to generate content: no model candidates succeeded.");

  if (errorToThrow.message === MODEL_OVERLOADED) {
    throw errorToThrow;
  }

  throw errorToThrow;
};

export const isModelOverloadedError = (error: unknown) =>
  error instanceof Error && error.message === MODEL_OVERLOADED;

// Legacy chat session interface for backward compatibility
export const chatSession = {
  sendMessage: async (prompt: string, model?: string) => {
    const text = await generateContent(prompt, model);
    return {
      response: {
        text: () => text
      }
    };
  }
};

