/**
 * Maps repeater `place` values (city / peak names from the API) to their
 * Bulgarian oblast (administrative area) name.
 *
 * Falls back to the raw place string for any unmapped value so the zone is
 * still created rather than silently dropped.
 */
export const PLACE_TO_OBLAST = new Map<string, string>([
  ['Аврен', 'Varna'],
  ['Асеновград', 'Plovdiv'],
  ['Банско', 'Blagoevgrad'],
  ['Благоевград', 'Blagoevgrad'],
  ['Ботев', 'Plovdiv'], // Botev Peak — Karlovo municipality
  ['Бузлуджа', 'Stara Zagora'], // Buzludzha Peak — Kazanlak municipality
  ['Бургас', 'Burgas'],
  ['Варна', 'Varna'],
  ['Велико Търново', 'Veliko Tarnovo'],
  ['Враца', 'Vratsa'],
  ['Габрово', 'Gabrovo'],
  ['Гоце Делчев', 'Blagoevgrad'],
  ['Димитровград', 'Haskovo'],
  ['Добринище', 'Blagoevgrad'],
  ['Добрич', 'Dobrich'],
  ['Златица', 'Sofia'], // Sofia Oblast (not Sofia City)
  ['Златоград', 'Smolyan'],
  ['Каварна', 'Dobrich'],
  ['Карлово', 'Plovdiv'],
  ['Кърджали', 'Kardzhali'],
  ['Кюстендил', 'Kyustendil'],
  ['Монтана', 'Montana'],
  ['Мусала', 'Sofia'], // Musala Peak — Samokov municipality, Sofia Oblast
  ['Оряхово', 'Vratsa'],
  ['Павликени', 'Veliko Tarnovo'],
  ['Пазарджик', 'Pazardzhik'],
  ['Пампорово', 'Smolyan'],
  ['Петрохан', 'Montana'], // Petrohan Pass — Berkovitsa municipality
  ['Пловдив', 'Plovdiv'],
  ['Поморие', 'Burgas'],
  ['Провадия', 'Varna'],
  ['Разград', 'Razgrad'],
  ['Русе', 'Ruse'],
  ['Сандански', 'Blagoevgrad'],
  ['Септември', 'Pazardzhik'],
  ['Силистра', 'Silistra'],
  ['Сливен', 'Sliven'],
  ['Слънчев Бряг', 'Burgas'],
  ['Смолян', 'Smolyan'],
  ['София', 'Sofia'],
  ['Стара Загора', 'Stara Zagora'],
  ['Хасково', 'Haskovo'],
  ['Царево', 'Burgas'],
  ['Шумен', 'Shumen'],
  ['Ябланица', 'Lovech'],
]);

/** Return the oblast for a given place, falling back to the place itself. */
export function oblastForPlace(place: string): string {
  return PLACE_TO_OBLAST.get(place) ?? place;
}
