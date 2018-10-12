// tslint:disable-next-line
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-$@#.:;=+)(*&^%!><?/\\";
export function randomId() {
  let text = "";
  
  for (let i = 0; i < 5; i++)
    text += chars.charAt(Math.floor(Math.random() * chars.length));

  return text;
}