import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["xlsx", "xls"].includes(ext)) {
      return NextResponse.json({ success: false, error: "Only .xlsx and .xls files are allowed" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const workbook = XLSX.read(bytes, { type: "array" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1, defval: "" });

    if (rawRows.length === 0) {
      return NextResponse.json({ success: false, error: "No data found" }, { status: 400 });
    }

    const headers = rawRows[0].map((h) => String(h).trim()).filter((h, i, arr) => i < arr.findLastIndex((x) => x !== "") + 1);
    while (headers.length > 0 && headers[headers.length - 1] === "") headers.pop();

    if (headers.length === 0) {
      return NextResponse.json({ success: false, error: "No headers found" }, { status: 400 });
    }

    const rows: string[][] = [];
    for (let i = 1; i < rawRows.length; i++) {
      const rowValues = rawRows[i].slice(0, headers.length).map((v) => String(v ?? "").trim());
      if (rowValues.every((v) => v === "")) continue;
      rows.push(rowValues);
    }

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: "No data rows found" }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: { headers, rows } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "Failed to parse Excel file" }, { status: 500 });
  }
}
