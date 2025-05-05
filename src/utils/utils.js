// Pega um objeto aleatoriamente do array
export function getRandomFromArray(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
}

// ajudas as palavras para o chatbot
export function sanitizeText(str) {
    return str
        .normalize("NFD") // remove acentos
        .replace(/[\u0300-\u036f]/g, "") // remove os diacríticos
        .replace(/[^a-zA-Z0-9\s]/g, "") // remove símbolos
        .replace(/\s+/g, " ") // colapsa múltiplos espaços em um só
        .trim() // remove espaços no início e fim
        .toLowerCase(); // transforma tudo em minúsculas
}