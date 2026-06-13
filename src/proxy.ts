import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "solydaries_session";

// Verificação rápida de presença do cookie de sessão; a validação completa
// (sessão existente, não expirada, conta ativa) acontece nas páginas via
// getSessionPerson, que consulta o banco.
export default function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (!hasSession) {
    const loginUrl = new URL("/entrar", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/painel/:path*",
    "/admin/:path*",
    "/moderacao/:path*",
    "/validacao/:path*",
    "/organizacoes/:path*",
    "/campanhas/:path*",
  ],
};
