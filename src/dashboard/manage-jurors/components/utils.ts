/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Juror } from "./types";
import { extractJurorsFromPDFApi } from "@/api/api";
import OpenAI from "openai";

export const generateAvatar = (name: string, gender?: string | null) => {
  // Use gender to determine which image to show
  // Gender is normalized to "male" | "female" | null
  const normalizedGender = gender?.toLowerCase() || "";

  if (normalizedGender === "female") {
    return "/female.png";
  }
  if (normalizedGender === "male") {
    return "/male.png";
  }
  // Not specified (null, undefined, empty, or other) → neutral
  return "/neutral.jpg";
};

export const getBiasColor = (status: string) => {
  switch (status) {
    case "low":
      return "bg-green-100 text-green-800 border-green-200";
    case "moderate":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "high":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const getAvailabilityColor = (availability: string) => {
  switch (availability) {
    case "Available":
      return "bg-green-100 text-green-800 border-green-200";
    case "Limited":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Unavailable":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Helper function to safely get string value
const safeString = (value: any, defaultValue = ""): string => {
  if (value === null || value === undefined || value === "") {
    return defaultValue;
  }
  return String(value);
};

// Helper function to safely get number value
const safeNumber = (value: any, defaultValue = 0): number => {
  if (value === null || value === undefined || value === "") {
    return defaultValue;
  }
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

// Extract and parse juror data from PDF using page-by-page processing
export const extractAndParseJurorsFromPDF = async (
  file: File,
  caseId: string
): Promise<Juror[]> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const allExtractedJurors: any[] = [];

  try {
    // Check if API key exists
    if (!apiKey) {
      throw new Error(
        "OpenAI API key not found. Please check your environment variables."
      );
    }

    // Create a script element to load PDF.js from CDN
    const loadPDFJS = (): Promise<any> => {
      return new Promise((resolve, reject) => {
        // Check if PDF.js is already loaded
        if (typeof window !== "undefined" && (window as any).pdfjsLib) {
          resolve((window as any).pdfjsLib);
          return;
        }

        // Load PDF.js from CDN
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        script.onload = () => {
          const pdfjsLib = (window as any).pdfjsLib;
          if (pdfjsLib) {
            // Set the worker source to match the library version
            pdfjsLib.GlobalWorkerOptions.workerSrc =
              "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
            resolve(pdfjsLib);
          } else {
            reject(new Error("Failed to load PDF.js library"));
          }
        };
        script.onerror = () =>
          reject(new Error("Failed to load PDF.js script"));
        document.head.appendChild(script);
      });
    };

    const pdfjsLib = await loadPDFJS();

    // Load PDF
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const totalPages = pdf.numPages;

    // Process pages in batches of 3 to avoid overwhelming the API
    const batchSize = 3;
    const batches = Math.ceil(totalPages / batchSize);

    for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
      const startPage = batchIndex * batchSize + 1;
      const endPage = Math.min((batchIndex + 1) * batchSize, totalPages);

      // Extract text from pages in this batch
      let batchText = "";

      for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(" ");

          batchText += `\n\n--- PAGE ${pageNum} ---\n${pageText}`;
        } catch (pageError) {
          console.warn(
            `⚠️ Failed to extract text from page ${pageNum}:`,
            pageError
          );
        }
      }

      if (batchText.trim()) {
        // Process this batch with OpenAI
        try {
          const batchJurors = await processBatchWithOpenAI(
            batchText,
            apiKey,
            startPage,
            endPage
          );
          allExtractedJurors.push(...batchJurors);
        } catch (batchError) {
          console.error(
            `❌ Failed to process batch ${batchIndex + 1}:`,
            batchError
          );
          // Continue with next batch instead of failing completely
        }
      }

      // Add small delay between batches to avoid rate limiting
      if (batchIndex < batches - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (allExtractedJurors.length === 0) {
      throw new Error(
        "No jurors were extracted from any pages of the PDF. Please check if the PDF contains readable juror information."
      );
    }

    // Process and format jurors
    const processedJurors: Juror[] = allExtractedJurors.map(
      (juror: any, index: number) => {
        return {
          id: `ai-${Date.now()}-${index}`,
          caseId: caseId,
          isStrikedOut: false,
          jurorNumber: safeString(
            juror.jurorNumber,
            `J-${String(index + 1).padStart(3, "0")}`
          ),
          name: safeString(juror.name, "Unknown Juror"),
          age: safeNumber(juror.age, 0),
          dateOfBirth: safeString(juror.dateOfBirth),
          // Gender: normalize to lowercase "male" or "female", or null
          gender: juror.gender 
            ? (juror.gender.toLowerCase() === "male" || juror.gender.toLowerCase() === "female" 
                ? juror.gender.toLowerCase() 
                : null)
            : null,
          race: safeString(juror.race),
          address: safeString(juror.address),
          mailingAddress: safeString(
            juror.mailingAddress,
            safeString(juror.address)
          ),
          phone: safeString(juror.phone),
          email: safeString(juror.email),
          county: safeString(juror.county),
          location: safeString(juror.location, safeString(juror.county)),
          occupation: safeString(juror.occupation),
          employer: safeString(juror.employer),
          employmentDuration: safeString(juror.employmentDuration),
          workPhone: safeString(juror.workPhone),
          education: safeString(juror.education),
          maritalStatus: safeString(juror.maritalStatus),
          spouse: safeString(juror.spouse),
          children: safeString(juror.children, "0"),
          citizenship: safeString(juror.citizenship, "Yes"),
          tdl: safeString(juror.tdl),
          criminalCase: safeString(juror.criminalCase, "No"),
          accidentalInjury: safeString(juror.accidentalInjury, "No"),
          civilJury: safeString(juror.civilJury, "No"),
          criminalJury: safeString(juror.criminalJury, "No"),
          // Panel Position: convert to number, or null if not a valid number
          panelPosition: juror.panelPosition !== null && juror.panelPosition !== undefined
            ? (typeof juror.panelPosition === "number" 
                ? juror.panelPosition 
                : (typeof juror.panelPosition === "string" && juror.panelPosition.trim() !== ""
                    ? (isNaN(Number(juror.panelPosition)) ? null : Number(juror.panelPosition))
                    : null))
            : null,
          experience: safeString(juror.experience, "No prior jury experience"),
          biasStatus: ["low", "moderate", "high"].includes(juror.biasStatus)
            ? juror.biasStatus
            : "moderate",
          availability: ["Available", "Limited", "Unavailable"].includes(
            juror.availability
          )
            ? juror.availability
            : "Available",
        };
      }
    );

    return processedJurors;
  } catch (error) {
    console.error("Error in PDF processing:", error);
    throw new Error(
      `Failed to process PDF: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Extract and parse juror data from image using OpenAI Vision API
export const extractAndParseJurorsFromImage = async (
  file: File,
  caseId: string
): Promise<Juror[]> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  try {
    // Check if API key exists
    if (!apiKey) {
      throw new Error(
        "OpenAI API key not found. Please check your environment variables."
      );
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
    });

    // Convert image to base64
    const base64 = await fileToBase64(file);

    // Determine MIME type
    const mimeType = file.type || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const prompt = `
You are an AI assistant specialized in extracting juror information from juror questionnaire documents.

Analyze this image of a juror questionnaire and extract ALL juror information you can find.

Return ONLY a JSON array of juror objects. Each juror object should have this exact structure:
{
  "jurorNumber": "string (e.g., 'J-001' or 'Juror 1')",
  "name": "string (full name)",
  "age": number,
  "dateOfBirth": "string (MM/DD/YYYY format if available)",
  "gender": "string - MUST be exactly 'male' or 'female' (lowercase) or null. Look for checked boxes next to 'Male' or 'Female' labels. If neither checkbox is checked or cannot be determined, use null.",
  "race": "string",
  "address": "string (full address)",
  "mailingAddress": "string (if different from address)",
  "phone": "string",
  "email": "string",
  "county": "string",
  "location": "string",
  "occupation": "string",
  "employer": "string",
  "employmentDuration": "string",
  "workPhone": "string",
  "education": "string",
  "maritalStatus": "string",
  "spouse": "string",
  "children": "string (number as string)",
  "citizenship": "string (Yes/No)",
  "tdl": "string (Texas Driver License if applicable)",
  "criminalCase": "string (Yes/No)",
  "accidentalInjury": "string (Yes/No)",
  "civilJury": "string (Yes/No)",
  "criminalJury": "string (Yes/No)",
  "panelPosition": "number (integer) - Extract the number after 'Panel Position:' or 'Panel Position' field. If not found or cannot be determined, use null (not 0, not empty string)",
  "experience": "string (description of prior jury experience)",
  "biasStatus": "string (low/moderate/high)",
  "availability": "string (Available/Limited/Unavailable)"
}

CRITICAL INSTRUCTIONS FOR GENDER:
- Look for checkbox fields labeled "Male" or "Female"
- If "Male" checkbox is checked/marked, return "male" (lowercase)
- If "Female" checkbox is checked/marked, return "female" (lowercase)
- If neither is checked or unclear, return null
- Do NOT use variations like "Male", "M", "Female", "F" - ONLY "male" or "female" (lowercase) or null

CRITICAL INSTRUCTIONS FOR PANEL POSITION:
- Look for text like "Panel Position: 4" or "Panel Position 4" or similar patterns
- Extract ONLY the numeric value (e.g., if "Panel Position: 4", return 4 as a number)
- If the field is missing or cannot be found, return null (not 0, not empty string)

Rules:
- Extract ALL jurors found in the image
- If a field is not available, use an empty string "" (except for gender and panelPosition which use null)
- For numbers, use 0 if not available (except panelPosition which uses null)
- For yes/no fields, use "No" as default if not specified
- For biasStatus, use "moderate" as default
- For availability, use "Available" as default
- Return ONLY the JSON array, no other text
- If no jurors found, return an empty array []
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image_url",
              image_url: {
                url: dataUrl,
                detail: "high",
              },
            },
          ],
        },
      ],
      max_tokens: 4000,
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    // Parse the JSON response
    let extractedJurors: any[] = [];
    try {
      // Try to extract JSON array from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        extractedJurors = JSON.parse(jsonMatch[0]);
      } else {
        // Try parsing the entire content
        extractedJurors = JSON.parse(content);
      }
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      console.error("Response content:", content);
      throw new Error(
        "Failed to parse juror data from image. Please ensure the image contains readable juror questionnaire information."
      );
    }

    if (!Array.isArray(extractedJurors)) {
      throw new Error("Invalid response format from OpenAI");
    }

    if (extractedJurors.length === 0) {
      throw new Error(
        "No jurors were extracted from the image. Please check if the image contains readable juror questionnaire information."
      );
    }

    // Process and format jurors
    const processedJurors: Juror[] = extractedJurors.map(
      (juror: any, index: number) => {
        return {
          id: `ai-image-${Date.now()}-${index}`,
          caseId: caseId,
          isStrikedOut: false,
          jurorNumber: safeString(
            juror.jurorNumber,
            `J-${String(index + 1).padStart(3, "0")}`
          ),
          name: safeString(juror.name, "Unknown Juror"),
          age: safeNumber(juror.age, 0),
          dateOfBirth: safeString(juror.dateOfBirth),
          // Gender: normalize to lowercase "male" or "female", or null
          gender: juror.gender 
            ? (juror.gender.toLowerCase() === "male" || juror.gender.toLowerCase() === "female" 
                ? juror.gender.toLowerCase() 
                : null)
            : null,
          race: safeString(juror.race),
          address: safeString(juror.address),
          mailingAddress: safeString(
            juror.mailingAddress,
            safeString(juror.address)
          ),
          phone: safeString(juror.phone),
          email: safeString(juror.email),
          county: safeString(juror.county),
          location: safeString(juror.location, safeString(juror.county)),
          occupation: safeString(juror.occupation),
          employer: safeString(juror.employer),
          employmentDuration: safeString(juror.employmentDuration),
          workPhone: safeString(juror.workPhone),
          education: safeString(juror.education),
          maritalStatus: safeString(juror.maritalStatus),
          spouse: safeString(juror.spouse),
          children: safeString(juror.children, "0"),
          citizenship: safeString(juror.citizenship, "Yes"),
          tdl: safeString(juror.tdl),
          criminalCase: safeString(juror.criminalCase, "No"),
          accidentalInjury: safeString(juror.accidentalInjury, "No"),
          civilJury: safeString(juror.civilJury, "No"),
          criminalJury: safeString(juror.criminalJury, "No"),
          // Panel Position: convert to number, or null if not a valid number
          panelPosition: juror.panelPosition !== null && juror.panelPosition !== undefined
            ? (typeof juror.panelPosition === "number" 
                ? juror.panelPosition 
                : (typeof juror.panelPosition === "string" && juror.panelPosition.trim() !== ""
                    ? (isNaN(Number(juror.panelPosition)) ? null : Number(juror.panelPosition))
                    : null))
            : null,
          experience: safeString(juror.experience, "No prior jury experience"),
          biasStatus: ["low", "moderate", "high"].includes(juror.biasStatus)
            ? juror.biasStatus
            : "moderate",
          availability: ["Available", "Limited", "Unavailable"].includes(
            juror.availability
          )
            ? juror.availability
            : "Available",
        };
      }
    );

    return processedJurors;
  } catch (error) {
    console.error("Error in image processing:", error);
    throw new Error(
      `Failed to process image: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

// Helper function to process a batch of pages with backend API (with token tracking)
const processBatchWithOpenAI = async (
  batchText: string,
  apiKey: string,
  startPage: number,
  endPage: number
): Promise<any[]> => {
  try {
    // Call backend API with token tracking
    const data = await extractJurorsFromPDFApi(batchText, startPage, endPage);
    return data.jurors || [];
  } catch (error: any) {
    console.error("Error processing batch:", error);

    if (error.response?.status === 429) {
      throw new Error(
        "Insufficient AI tokens. Please upgrade your plan or wait for your tokens to reset."
      );
    } else if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else {
      throw new Error(
        `Failed to process batch: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
};
