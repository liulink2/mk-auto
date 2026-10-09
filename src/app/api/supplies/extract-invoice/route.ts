import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

// Reads ANTHROPIC_API_KEY from the environment.
const anthropic = new Anthropic();

type SupplierOption = {
  id: string;
  name: string;
  parent: { name: string } | null;
};

const buildPrompt = (suppliers: SupplierOption[]) => `
Extract the data from this supplier invoice.

- invoiceNumber: the invoice number as printed, empty string if not found.
- supplierId: the id of the supplier below that issued this invoice, empty string if none match.
- suppliedDate: the invoice date as YYYY-MM-DD, empty string if not found.
- items: one entry per invoice line. Use plain numbers (no currency symbols).
  quantity is the line quantity, price is the unit price, gstAmount is the GST for the line,
  totalAmount is the line total. Use 0 for any amount that is not shown.

Suppliers (id: name):
${suppliers
  .map((s) => `${s.id}: ${s.name}${s.parent ? ` (${s.parent.name})` : ""}`)
  .join("\n")}
`;

const buildSchema = (supplierIds: string[]) => ({
  type: "object",
  additionalProperties: false,
  required: ["invoiceNumber", "supplierId", "suppliedDate", "items"],
  properties: {
    invoiceNumber: { type: "string" },
    supplierId: { type: "string", enum: [...supplierIds, ""] },
    suppliedDate: {
      type: "string",
      description: "YYYY-MM-DD, empty string if unknown",
    },
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "name",
          "description",
          "quantity",
          "price",
          "gstAmount",
          "totalAmount",
        ],
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          quantity: { type: "number" },
          price: { type: "number" },
          gstAmount: { type: "number" },
          totalAmount: { type: "number" },
        },
      },
    },
  },
});

export async function POST(request: Request) {
  try {
    const { imageBase64 } = await request.json();
    if (!imageBase64) {
      return NextResponse.json(
        { error: "Missing invoice image" },
        { status: 400 }
      );
    }

    // Same list as the supplier dropdown: active suppliers without children.
    const suppliers = await prisma.supplier.findMany({
      where: { isActive: true, children: { none: {} } },
      select: { id: true, name: true, parent: { select: { name: true } } },
    });

    const response = await anthropic.messages.create({
      model: "claude-haiku-5-5",
      max_tokens: 4096,
      // Plain transcription; thinking adds cost without improving it.
      thinking: { type: "disabled" },
      output_config: {
        format: {
          type: "json_schema",
          schema: buildSchema(suppliers.map((s) => s.id)),
        },
      },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: imageBase64,
              },
            },
            { type: "text", text: buildPrompt(suppliers) },
          ],
        },
      ],
    });

    if (response.stop_reason === "max_tokens") {
      console.error("Invoice extraction truncated");
      return NextResponse.json(
        { error: "Invoice too long to read in one go" },
        { status: 422 }
      );
    }
    if (response.stop_reason === "refusal") {
      console.error("Invoice extraction refused:", response.stop_details);
      return NextResponse.json(
        { error: "The invoice could not be processed" },
        { status: 422 }
      );
    }

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");

    try {
      return NextResponse.json({ data: JSON.parse(text) });
    } catch {
      console.error("Invoice extraction returned invalid JSON:", text);
      return NextResponse.json(
        { error: "Could not read the invoice data" },
        { status: 422 }
      );
    }
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error("Anthropic error:", error.status, error.message);
    } else {
      console.error("Error:", error);
    }
    return NextResponse.json(
      { error: "Failed to process invoice" },
      { status: 500 }
    );
  }
}
