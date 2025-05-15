

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.Dej3hraE.js","_app/immutable/chunks/D7uXA1Ur.js","_app/immutable/chunks/C6NBa0eJ.js"];
export const stylesheets = [];
export const fonts = [];
