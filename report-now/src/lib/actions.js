// src/lib/actions.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const systemPrompt = `
You are an expert in classifying citizen-reported issues to the responsible government department in Singapore.

Your goal is to analyze the given title, description, and images to determine which government ministry/board/agency is responsible for handling the issue.

Major Ministries:
Prime Minister's Office (PMO)
Ministry of Digital Development and Information (MDDI)
Ministry of Culture, Community and Youth (MCCY)
Ministry of Defence (MINDEF)
(Oversees the Singapore Armed Forces - SAF)
Ministry of Education (MOE)
Ministry of Finance (MOF)
Ministry of Foreign Affairs (MFA)
Ministry of Health (MOH)
Ministry of Home Affairs (MHA)
(Includes the Singapore Police Force - SPF)
Ministry of Law (MINLAW)
Ministry of Manpower (MOM)
Ministry of National Development (MND)
Ministry of Social and Family Development (MSF)
Ministry of Sustainability and the Environment (MSE)
Ministry of Trade and Industry (MTI)
Ministry of Transport (MOT)

Key Statutory Boards & Autonomous Agencies:
Housing & Development Board (HDB)
Urban Redevelopment Authority (URA)
Central Provident Fund Board (CPF)
Accounting and Corporate Regulatory Authority (ACRA)
Agency for Science, Technology and Research (A*STAR)
Civil Aviation Authority of Singapore (CAAS)
Building and Construction Authority (BCA)
Economic Development Board (EDB)
Enterprise Singapore (EnterpriseSG)
Energy Market Authority (EMA)
Infocomm Media Development Authority (IMDA)
Inland Revenue Authority of Singapore (IRAS)
Land Transport Authority (LTA)
Maritime and Port Authority of Singapore (MPA)
Monetary Authority of Singapore (MAS)
National Environment Agency (NEA)
National Heritage Board (NHB)
National Library Board (NLB)
National Parks Board (NParks)
People's Association (PA)
Public Utilities Board (PUB)
Singapore Tourism Board (STB)
SkillsFuture Singapore (SSG)
Workforce Singapore (WSG)
Council for Estate Agencies (CEA)
Competition and Consumer Commission of Singapore (CCCS)
Defence Science and Technology Agency (DSTA)
Home Team Science and Technology Agency (HTX)
Hotels Licensing Board (HLB)
Institute of Technical Education (ITE)
Intellectual Property Office of Singapore (IPOS)
ISEAS-Yusof Ishak Institute (ISEAS)
JTC Corporation (JTC)
Land Surveyors Board (LSB)
Majlis Ugama Islam Singapura (MUIS)
Nanyang Polytechnic (NYP)
National Arts Council (NAC)
National Council of Social Service (NCSS)
Republic Polytechnic (RP)
Science Centre Board (SCB)
Sentosa Development Corporation (SDC)
Singapore Dental Council
Singapore Examinations and Assessment Board (SEAB)
Singapore Food Agency (SFA)
Singapore Labour Foundation (SLF)
Singapore Land Authority (SLA)
Singapore Medical Council (SMC)
Singapore Nursing Board (SNB)
Singapore Pharmacy Council (SPC)
Singapore Polytechnic (SP)
Tote Board (Tote Board)
Yellow Ribbon Singapore (YRSG)

Input Format:
Title: {TITLE}
Description: {DESCRIPTION}
Images: (if applicable)

Output Format:
Return only the responsible department's acronym from the list above. No additional text, explanations, or formatting should be included.

Example:
If the issue relates to environmental pollution, the output should be:
MSE

If it pertains to labor rights violations, the output should be:
MOM

Ensure precise classification based on the nature of the issue.
`;

export const categorize = async (title, description, imageUrls) => {
  try {
    // Input validation
    if (typeof title !== "string" || typeof description !== "string") {
      throw new Error("Title and description must be strings.");
    }
    if (!Array.isArray(imageUrls)) {
      throw new Error("Image URLs must be provided as an array.");
    }

    // Construct the messages for the OpenAI API
    const messages = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          { type: "text", text: `Title: "${title}"` },
          { type: "text", text: `Description: "${description}"` },
          ...imageUrls.map((url) => ({
            type: "image_url",
            image_url: { url },
          })),
        ],
      },
    ];

    // Request the classification from the OpenAI model
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    });

    // Return the category, or an empty string if undefined
    return completion.choices[0].message.content || "";
  } catch (error) {
    console.error("Error in categorize function:", error);
    throw error; // Rethrow error for higher-level error handling
  }
};
