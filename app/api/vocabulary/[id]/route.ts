import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = await request.json();
  const { category, word, reading, meaning, partOfSpeech = "", familiarity = "" } = body;
  if (!word?.trim() || !reading?.trim() || !meaning?.trim()) {
    return NextResponse.json({ error: "单词、假名和翻译为必填项" }, { status: 400 });
  }
  const db = await getDb();
  try {
    await db.execute(
      `UPDATE vocabulary SET category = ?, word = ?, reading = ?, meaning = ?,
        part_of_speech = ?, familiarity = ? WHERE id = ?`,
      [category, word.trim(), reading.trim(), meaning.trim(), partOfSpeech.trim(), familiarity.trim(), id],
    );
  } finally {
    await db.end();
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const db = await getDb();
  try {
    await db.execute("DELETE FROM vocabulary WHERE id = ?", [id]);
  } finally {
    await db.end();
  }
  return NextResponse.json({ ok: true });
}
