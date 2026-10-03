import { GoogleGenAI } from "@google/genai";

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured in the server environment."
    );
  }

  return new GoogleGenAI({
    apiKey,
  });
};

const classifyServiceRequest = async ({
  title,
  description,
  categories,
}) => {
  if (!title || !description) {
    throw new Error(
      "Title and description are required for AI classification."
    );
  }

  if (!Array.isArray(categories) || categories.length === 0) {
    throw new Error(
      "At least one active service category is required for AI classification."
    );
  }

  const ai = getGeminiClient();

  const model =
    process.env.GEMINI_MODEL ||
    "gemini-3.8-flash";

  const categoryList = categories.map((category) => ({
    id: category._id.toString(),
    name: category.name,
    description: category.description || "",
    requiredSkills: category.requiredSkills || [],
  }));

  const prompt = `
You are the AI classification engine for CareConnect, a home services booking platform.

Your task is to classify a customer's service request.

CUSTOMER REQUEST TITLE:
${title}

CUSTOMER REQUEST DESCRIPTION:
${description}

AVAILABLE SERVICE CATEGORIES:
${JSON.stringify(categoryList, null, 2)}

Rules:

1. Select exactly one category from the available service categories.
2. Use the category ID exactly as provided.
3. Do not invent a category.
4. Identify the practical skills required to solve the customer's problem.
5. Determine urgency:
   - low: minor issue with little immediate impact
   - normal: regular service request
   - high: important issue requiring relatively quick attention
   - emergency: immediate safety risk, severe damage, or urgent critical failure
6. Confidence must be between 0 and 1.
7. Provide a short summary of the customer's problem.
8. Return only the requested JSON structure.
`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      temperature: 0.1,
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          categoryId: {
            type: "string",
            description:
              "The MongoDB ID of the selected service category.",
          },
          requiredSkills: {
            type: "array",
            items: {
              type: "string",
            },
            description:
              "Skills required to complete the requested service.",
          },
          urgency: {
            type: "string",
            enum: [
              "low",
              "normal",
              "high",
              "emergency",
            ],
          },
          confidence: {
            type: "number",
            minimum: 0,
            maximum: 1,
          },
          summary: {
            type: "string",
            description:
              "A short summary of the customer's service problem.",
          },
        },
        required: [
          "categoryId",
          "requiredSkills",
          "urgency",
          "confidence",
          "summary",
        ],
      },
    },
  });

  let result;

  try {
    result = JSON.parse(response.text);
  } catch (error) {
    throw new Error(
      "Gemini returned an invalid JSON response."
    );
  }

  const selectedCategory = categories.find(
    (category) =>
      category._id.toString() === result.categoryId
  );

  if (!selectedCategory) {
    throw new Error(
      "AI selected a category that is not available."
    );
  }

  const allowedUrgencies = [
    "low",
    "normal",
    "high",
    "emergency",
  ];

  const urgency = allowedUrgencies.includes(
    result.urgency
  )
    ? result.urgency
    : "normal";

  const confidence = Math.min(
    1,
    Math.max(
      0,
      Number(result.confidence) || 0
    )
  );

  const requiredSkills = Array.isArray(
    result.requiredSkills
  )
    ? result.requiredSkills
        .filter(
          (skill) =>
            typeof skill === "string" &&
            skill.trim().length > 0
        )
        .map((skill) => skill.trim())
        .slice(0, 10)
    : [];

  return {
    category: selectedCategory,
    requiredSkills,
    urgency,
    confidence,
    summary:
      typeof result.summary === "string"
        ? result.summary.trim()
        : "",
  };
};

export {
  classifyServiceRequest,
};