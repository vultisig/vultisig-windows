type KeyOfUnion<U> = U extends any ? keyof U : never;
type ValueForKey<U, K extends string | number | symbol> =
  U extends Record<K, infer V> ? V : never;

export function matchRecordUnion<U, R>(
  value: U,
  handlers: { [K in KeyOfUnion<U>]: (val: ValueForKey<U, K>) => R },
): R {
  const key = Object.keys(value as any)[0] as KeyOfUnion<U>;
  return handlers[key]((value as any)[key]);
}

// Example usage:
// type Animal =
//   | { dog: { breed: string; barks: boolean } }
//   | { cat: { breed: string; meows: boolean } }
//   | { bird: { species: string; flies: boolean } };

// const myPet: Animal = {
//   dog: { breed: "Labrador", barks: true },
// };

// const sound = matchRecordUnion<Animal, string>(myPet, {
//   dog: (dog) => (dog.barks ? "Woof!" : "Silent dog"),
//   cat: (cat) => (cat.meows ? "Meow!" : "Silent cat"),
//   bird: (bird) => (bird.flies ? "Tweet!" : "Silent bird"),
// });

// sound === 'Woof!'
