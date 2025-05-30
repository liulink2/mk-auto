import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const prompt = `
Extract information from this invoice and return ONLY a string which is serialised valid JSON object in this below structure. Do not put result into json wrapper
{
  "invoiceNumber": "",
  "supplierId": "",
  "suppliedDate": "",
  "items": [
    {
      "name": "",
      "description": "",
      "quantity": "",
      "price": "",
      "gstAmount": "",
      "totalAmount": "",
}
`;

export async function POST(request: Request) {
  try {
    const { imageBase64 } = await request.json();

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini", //"gpt-4o", // or "gpt-4-vision-preview"
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
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    const extractedData = response.choices[0].message.content;
    // Try to parse as JSON
    let jsonData;
    try {
      jsonData = JSON.parse(extractedData || "{}");
    } catch {
      // If not valid JSON, return the raw text
      jsonData = { raw_text: extractedData };
    }

    return NextResponse.json({ data: jsonData });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to process invoice" },
      { status: 500 }
    );
  }
}
