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
    // A Página da Organização (/organizacoes/[id]) é pública para organizações
    // validadas; só a lista pessoal e a edição exigem login.
    "/organizacoes",
    "/organizacoes/:id/editar",
    // A descoberta pública /campanhas e a página da campanha são abertas a
    // visitantes; só criação e edição exigem login.
    "/minhas-campanhas/:path*",
    "/campanhas/nova",
    "/campanhas/:id/editar",
  ],
};
