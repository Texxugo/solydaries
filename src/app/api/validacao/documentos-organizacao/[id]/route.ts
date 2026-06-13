import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionPerson } from "@/lib/session";
import { isAdmin } from "@/lib/authz";
import { readPrivateFile } from "@/lib/private-files";

// Documentos de validação de organização seguem as mesmas regras dos
// documentos de pessoa: privados e visíveis apenas para administradores.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const person = await getSessionPerson();
  if (!person || !isAdmin(person)) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const { id } = await params;
  const document = await prisma.organizationValidationDocument.findUnique({
    where: { id },
  });
  if (!document) {
    return NextResponse.json(
      { error: "Documento não encontrado." },
      { status: 404 }
    );
  }

  const content = await readPrivateFile(
    "validation-documents",
    document.storedName
  );

  return new NextResponse(new Uint8Array(content), {
    headers: {
      "Content-Type": document.mimeType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(document.fileName)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
