const lowercaseParticles = new Set(["da", "das", "de", "do", "dos", "e"]);

// Normaliza nomes digitados em caixa alta/baixa para exibição:
// "LUIS FELIPE DOS SANTOS" -> "Luis Felipe dos Santos".
export function formatPersonName(name: string) {
  return name
    .trim()
    .toLocaleLowerCase("pt-BR")
    .split(/\s+/)
    .map((word, index) => {
      if (index > 0 && lowercaseParticles.has(word)) return word;
      return word.charAt(0).toLocaleUpperCase("pt-BR") + word.slice(1);
    })
    .join(" ");
}
