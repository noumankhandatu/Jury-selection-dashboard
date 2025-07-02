/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Juror } from "./types";

export const generateAvatar = (name: string) => {
  if (!name) {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=default&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
  }
  const safeName = String(name).replace(/\s+/g, "");
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${safeName}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
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
const safeString = (value: any, defaultValue = "Not Specified"): string => {
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
export const extractAndParseJurorsFromPDF = async (file: File, caseId: string): Promise<Juror[]> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const allExtractedJurors: any[] = [];

  try {
    // Check if API key exists
    if (!apiKey) {
      throw new Error("OpenAI API key not found. Please check your environment variables.");
    }

    // Create a script element to load PDF.js from CDN
    const loadPDFJS = (): Promise<any> => {
      return new Promise((resolve, reject) => {
        // Check if PDF.js is already loaded
        if (typeof window !== "undefined" && (window as any).pdfjsLib) {
          console.log("PDF.js already loaded");
          resolve((window as any).pdfjsLib);
          return;
        }

        // Load PDF.js from CDN
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        script.onload = () => {
          const pdfjsLib = (window as any).pdfjsLib;
          if (pdfjsLib) {
            // Set the worker source to match the library version
            pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
            resolve(pdfjsLib);
          } else {
            reject(new Error("Failed to load PDF.js library"));
          }
        };
        script.onerror = () => reject(new Error("Failed to load PDF.js script"));
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
          const pageText = textContent.items.map((item: any) => item.str).join(" ");

          batchText += `\n\n--- PAGE ${pageNum} ---\n${pageText}`;
        } catch (pageError) {
          console.warn(`⚠️ Failed to extract text from page ${pageNum}:`, pageError);
        }
      }

      if (batchText.trim()) {
        // Process this batch with OpenAI
        try {
          const batchJurors = await processBatchWithOpenAI(batchText, apiKey, startPage, endPage);
          allExtractedJurors.push(...batchJurors);
        } catch (batchError) {
          console.error(`❌ Failed to process batch ${batchIndex + 1}:`, batchError);
          // Continue with next batch instead of failing completely
        }
      }

      // Add small delay between batches to avoid rate limiting
      if (batchIndex < batches - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (allExtractedJurors.length === 0) {
      throw new Error("No jurors were extracted from any pages of the PDF. Please check if the PDF contains readable juror information.");
    }

    // Process and format jurors
    const processedJurors: Juror[] = allExtractedJurors.map((juror: any, index: number) => {
      return {
        id: `ai-${Date.now()}-${index}`,
        caseId: caseId,
        isStrikedOut: false,
        jurorNumber: safeString(juror.jurorNumber, `J-${String(index + 1).padStart(3, "0")}`),
        name: safeString(juror.name, "Unknown Juror"),
        age: safeNumber(juror.age, 0),
        dateOfBirth: safeString(juror.dateOfBirth),
        gender: safeString(juror.gender),
        race: safeString(juror.race),
        address: safeString(juror.address),
        mailingAddress: safeString(juror.mailingAddress, safeString(juror.address)),
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
        panelPosition: safeString(juror.panelPosition),
        experience: safeString(juror.experience, "No prior jury experience"),
        biasStatus: ["low", "moderate", "high"].includes(juror.biasStatus) ? juror.biasStatus : "moderate",
        availability: ["Available", "Limited", "Unavailable"].includes(juror.availability) ? juror.availability : "Available",
      };
    });

    return processedJurors;
  } catch (error) {
    console.error("Error in PDF processing:", error);
    throw new Error(`Failed to process PDF: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};

// Helper function to process a batch of pages with OpenAI
const processBatchWithOpenAI = async (batchText: string, apiKey: string, startPage: number, endPage: number): Promise<any[]> => {
  const requestPayload = {
    model: "gpt-4o-mini", // Using mini model for better rate limits and cost
    messages: [
      {
        role: "user",
        content: `Please analyze this text from pages ${startPage}-${endPage} of a juror questionnaire PDF and extract information about any jurors mentioned. Look for ALL available information including form fields, signatures, codes, and any other data.

TEXT TO ANALYZE:
${batchText}

Extract information for each juror and return it as a JSON object with this exact structure:
{
  "jurors": [
    {
      "name": "Full Name",
      "signature": "Signature if different from name",
      "jurorNumber": "Juror # or ID number",
      "age": 30,
      "dateOfBirth": "MM/DD/YYYY or birth date",
      "ageRange": "Age range if specified",
      "occupation": "Job Title",
      "education": "Education Level",
      "address": "Full Address",
      "mailingAddress": "Mailing address if different",
      "phone": "Phone Number",
      "workPhone": "Work phone number",
      "email": "Email Address",
      "gender": "Gender",
      "race": "Race/Ethnicity",
      "maritalStatus": "Marital Status",
      "spouse": "Spouse Name and details",
      "children": "Number of Children or details",
      "county": "County Name",
      "employer": "Employer Name and details",
      "employmentDuration": "How long employed",
      "tdl": "TDL# or Driver's License number",
      "panelPosition": "Panel Position number",
      "panelCodes": "Panel Codes (comma separated)",
      "criminalCase": "Yes/No or details",
      "civilJury": "Yes/No or details", 
      "criminalJury": "Yes/No or details",
      "accidentalInjury": "Yes/No or details",
      "citizenship": "Citizenship status",
      "experience": "Brief description of jury experience",
      "biasStatus": "low",
      "availability": "Available"
    }
  ]
}

IMPORTANT EXTRACTION INSTRUCTIONS:
- Extract ALL jurors found in these pages
- Look for every piece of information including numbers, dates, codes, signatures
- If specific information is missing, use "Not Specified" as default
- For Yes/No fields, look for checkmarks, X marks, or written responses
- Assess bias status as "low", "moderate", or "high" based on responses
- Set availability as "Available" unless otherwise indicated
- Return ONLY the JSON object, no additional text or explanations
- If no jurors are found in these pages, return {"jurors": []}`,
      },
    ],
    max_tokens: 4000,
    temperature: 0.1,
  };

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestPayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI processing error:", errorText);
    throw new Error(`Failed to process batch with OpenAI: ${response.status} ${response.statusText}`);
  }

  const responseData = await response.json();
  const extractedText = responseData.choices?.[0]?.message?.content;

  if (!extractedText) {
    console.warn("No content in OpenAI response for this batch");
    return [];
  }

  // Parse JSON response
  try {
    let jsonText = extractedText.trim();

    // Remove markdown code blocks if present
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/, "").replace(/\n?```$/, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/, "").replace(/\n?```$/, "");
    }

    // Try to find JSON object
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const extractedData = JSON.parse(jsonMatch[0]);
      return extractedData.jurors || [];
    } else {
      console.warn("No JSON object found in response for this batch");
      return [];
    }
  } catch (parseError) {
    console.error("JSON parsing failed for batch:", parseError);
    console.log("Text that failed to parse:", extractedText);
    return []; // Return empty array instead of throwing error
  }
};
