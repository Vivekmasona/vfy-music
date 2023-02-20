const c = [
  'linear-gradient(45deg, #88c0d0, #5e81ac)',
  'linear-gradient(45deg, #5e81ac, #b48ead)',
  'linear-gradient(45deg, #a3be8c, #88c0d0)',
  'linear-gradient(45deg, #ebcb8b, #a3be8c)',
  'linear-gradient(45deg, #d08770, #bf616a)',
];

export function useRand() {
  const i = Math.floor(Math.random() * c.length);
  return c[i];
}
