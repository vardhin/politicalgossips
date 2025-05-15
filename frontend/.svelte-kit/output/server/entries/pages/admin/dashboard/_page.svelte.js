import { G as head, D as pop, A as push } from "../../../../chunks/index.js";
import "../../../../chunks/client.js";
function _page($$payload, $$props) {
  push();
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Admin Dashboard - Political Gossips</title>`;
  });
  {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="loading-container svelte-kv1s9f"><div class="loading-spinner svelte-kv1s9f"></div> <p class="svelte-kv1s9f">Loading...</p></div>`;
  }
  $$payload.out += `<!--]-->`;
  pop();
}
export {
  _page as default
};
