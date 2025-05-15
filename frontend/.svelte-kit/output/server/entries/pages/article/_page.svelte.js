import { E as getContext, K as store_get, G as head, F as escape_html, M as unsubscribe_stores, D as pop, A as push, I as attr } from "../../../chunks/index.js";
import "../../../chunks/client.js";
import { N as NavBar } from "../../../chunks/NavBar.js";
const getStores = () => {
  const stores$1 = getContext("__svelte__");
  return {
    /** @type {typeof page} */
    page: {
      subscribe: stores$1.page.subscribe
    },
    /** @type {typeof navigating} */
    navigating: {
      subscribe: stores$1.navigating.subscribe
    },
    /** @type {typeof updated} */
    updated: stores$1.updated
  };
};
const page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};
function _page($$payload, $$props) {
  push();
  var $$store_subs;
  const navLinks = [
    { href: "/", label: "Home", active: false },
    {
      href: "/category/general",
      label: "General",
      active: false
    },
    {
      href: "/category/political",
      label: "Political",
      active: false
    },
    {
      href: "/contact",
      label: "Contact",
      active: false
    }
  ];
  store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("id");
  store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("slug");
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>${escape_html("Article - Political Gossips")}</title>`;
    $$payload2.out += `<meta name="description"${attr("content", "Political news and analysis")} class="svelte-g46pyg">`;
  });
  $$payload.out += `<div class="container svelte-g46pyg">`;
  NavBar($$payload, {
    brand: "Political Gossips",
    links: navLinks,
    sticky: true
  });
  $$payload.out += `<!----> <main class="svelte-g46pyg"><section class="article-section glass-panel svelte-g46pyg">`;
  {
    $$payload.out += "<!--[1-->";
    $$payload.out += `<div class="loading-container svelte-g46pyg"><div class="loading-spinner svelte-g46pyg"></div> <p class="svelte-g46pyg">Loading article...</p></div>`;
  }
  $$payload.out += `<!--]--></section></main> <footer class="glass-panel svelte-g46pyg"><div class="copyright svelte-g46pyg">© ${escape_html((/* @__PURE__ */ new Date()).getFullYear())} Political Gossips. All rights reserved.</div></footer></div>`;
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
export {
  _page as default
};
