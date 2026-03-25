import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

function getGenAI() {
    const key = process.env.GEMINI_API_KEY || "";
    if (!key || key === 'your_gemini_api_key_here') {
        throw new Error("Gemini API key is required but missing or invalid.");
    }
    return new GoogleGenerativeAI(key);
}

/**
 * Perform a real AI security analysis on a finding using Gemini
 */
export async function performGeminiAnalysis(finding: any): Promise<{
    analysis: string;
    steps: string[];
    riskScore: number;
    toolsNeeded: string[];
}> {
    const genAI = getGenAI();
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            You are a Senior SOC Security Analyst. Perform a deep security analysis on the following discovery from a Linux node:
            Finding Name: ${finding.name}
            Finding Type: ${finding.type}
            Tactical Indicator/Location: ${finding.indicator}
            Description: ${finding.description}
            
            Provide a professional analysis, a step-by-step remediation plan to remove this threat, a risk score between 1-10, and a list of Linux tools needed to resolve it.
            
            Format the response as a valid JSON object with these fields:
            - analysis: string (professional SOC analysis of the threat)
            - steps: string[] (clear, actionable remediation steps)
            - riskScore: number (1-10)
            - toolsNeeded: string[] (list of commands or packages needed)
            
            IMPORTANT: Return ONLY the raw JSON object, no markdown, no conversational text.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        // Sanitize response to extract JSON if Gemini includes markdown codes
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Failed to parse AI response as JSON");
        
        const jsonResponse = JSON.parse(jsonMatch[0]);
        console.log("[GeminiService] Real AI analysis completed.");
        return jsonResponse;
    } catch (error) {
        console.error("[GeminiService] Analysis failed:", error);
        throw error;
    }
}
