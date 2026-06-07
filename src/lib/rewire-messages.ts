export const REWIRE_MESSAGES = [
  "Через 10 минут ты будешь рад, что не закурил.",
  "Тяга проходит. Сожаление о срыве остаётся.",
  "Тебе не нужна сигарета. Тебе нужно пережить эту волну.",
  "Сейчас проверяется, кто принимает решение: ты или никотин.",
  "Ты не хочешь курить. Ты хочешь прекратить ломку от предыдущей сигареты.",
  "Каждая сигарета создаёт проблему, которую следующая временно решает.",
  "Ни один бывший курильщик не жалеет о пропущенной сигарете.",
  "Эта сигарета не решит стресс. Она просто вернёт зависимость на старт.",
  "Первая сигарета — это не одна сигарета. Это запуск цепочки.",
  "Ты уже начал выходить. Не заходи обратно.",
  "Сейчас не нужна сила воли на всю жизнь. Нужны только ближайшие 10 минут.",
  "Сигарета обещает облегчение, но продаёт новый круг зависимости.",
  "Ты не обязан побеждать навсегда. Только не закури сейчас.",
  "Желание закурить — это волна. Волна не длится вечно.",
  "Если закуришь сейчас, легче станет на минуту. Хуже станет потом.",
  "Ты не теряешь сигарету. Ты возвращаешь себе контроль.",
  "Никотин просит первую. Потом он попросит вторую.",
  "Срыв начинается не с пачки. Срыв начинается с первой.",
  "Твоё будущее «я» скажет спасибо за эти 10 минут.",
  "Деньги можно заработать снова. Здоровье вернуть сложнее.",
  "Ты платишь не за сигарету. Ты платишь за продолжение зависимости.",
  "Эта сигарета стоит дороже, чем кажется.",
  "Каждая невыкуренная сигарета — это голос за тебя.",
  "Не спорь с тягой. Просто пережди её.",
  "Ты не слабый. Просто зависимость громко разговаривает.",
  "Сегодня твоя победа — не закурить первую.",
  "Одна сигарета не бывает одной, если ты бросаешь.",
  "Сейчас мозг торгуется. Не заключай сделку с зависимостью.",
  "Пауза сильнее импульса.",
  "Ты уже выдержал до этого момента. Выдержи ещё немного.",
  "Первая сигарета — это дверь, которую ты сам закрыл. Не открывай снова.",
  "10 минут дискомфорта легче пережить, чем дни сожаления.",
] as const;

const LAST_REWIRE_INDEX_KEY = "last_rewire_message_index";

function getLastIndex() {
  if (typeof window === "undefined") return -1;

  const stored = localStorage.getItem(LAST_REWIRE_INDEX_KEY);
  if (stored === null) return -1;

  const index = Number(stored);
  return Number.isInteger(index) ? index : -1;
}

function saveLastIndex(index: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAST_REWIRE_INDEX_KEY, String(index));
}

function pickRandomIndex(excludeIndex: number) {
  if (REWIRE_MESSAGES.length <= 1) return 0;

  let index = Math.floor(Math.random() * REWIRE_MESSAGES.length);

  while (index === excludeIndex) {
    index = Math.floor(Math.random() * REWIRE_MESSAGES.length);
  }

  return index;
}

export function pickRewireMessage(): string {
  const index = pickRandomIndex(getLastIndex());
  saveLastIndex(index);
  return REWIRE_MESSAGES[index];
}

export function pickRewireMessages(count: number): string[] {
  const safeCount = Math.min(count, REWIRE_MESSAGES.length);
  const lastIndex = getLastIndex();
  const indices: number[] = [];

  while (indices.length < safeCount) {
    const index = Math.floor(Math.random() * REWIRE_MESSAGES.length);
    if (indices.includes(index)) continue;

    if (indices.length === 0 && index === lastIndex && REWIRE_MESSAGES.length > safeCount) {
      continue;
    }

    indices.push(index);
  }

  saveLastIndex(indices[indices.length - 1]);
  return indices.map((index) => REWIRE_MESSAGES[index]);
}
