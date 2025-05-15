import { N as sanitize_props, O as rest_props, P as fallback, Q as ensure_array_like, R as spread_attributes, S as clsx, T as element, U as slot, V as bind_props, D as pop, A as push, W as spread_props, J as attr_class, F as escape_html, I as attr, K as store_get, M as unsubscribe_stores } from "./index.js";
import { w as writable } from "./index2.js";
function createThemeStore() {
  const defaultTheme = "light";
  const { subscribe, set, update } = writable(defaultTheme);
  return {
    subscribe,
    setTheme: (theme2) => {
      set(theme2);
    },
    toggle: () => update((current) => {
      const newTheme = current === "dark" ? "light" : "dark";
      return newTheme;
    })
  };
}
const theme = createThemeStore();
/**
 * @license lucide-svelte v0.510.0 - ISC
 *
 * ISC License
 * 
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
 * 
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 * 
 */
const defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": 2,
  "stroke-linecap": "round",
  "stroke-linejoin": "round"
};
function Icon($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "name",
    "color",
    "size",
    "strokeWidth",
    "absoluteStrokeWidth",
    "iconNode"
  ]);
  push();
  let name = fallback($$props["name"], void 0);
  let color = fallback($$props["color"], "currentColor");
  let size = fallback($$props["size"], 24);
  let strokeWidth = fallback($$props["strokeWidth"], 2);
  let absoluteStrokeWidth = fallback($$props["absoluteStrokeWidth"], false);
  let iconNode = fallback($$props["iconNode"], () => [], true);
  const mergeClasses = (...classes) => classes.filter((className, index, array) => {
    return Boolean(className) && array.indexOf(className) === index;
  }).join(" ");
  const each_array = ensure_array_like(iconNode);
  $$payload.out += `<svg${spread_attributes(
    {
      ...defaultAttributes,
      ...$$restProps,
      width: size,
      height: size,
      stroke: color,
      "stroke-width": absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
      class: clsx(mergeClasses("lucide-icon", "lucide", name ? `lucide-${name}` : "", $$sanitized_props.class))
    },
    null,
    void 0,
    void 0,
    3
  )}><!--[-->`;
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let [tag, attrs] = each_array[$$index];
    element($$payload, tag, () => {
      $$payload.out += `${spread_attributes({ ...attrs }, null, void 0, void 0, 3)}`;
    });
  }
  $$payload.out += `<!--]--><!---->`;
  slot($$payload, $$props, "default", {});
  $$payload.out += `<!----></svg>`;
  bind_props($$props, {
    name,
    color,
    size,
    strokeWidth,
    absoluteStrokeWidth,
    iconNode
  });
  pop();
}
function Moon($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "path",
      { "d": "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" }
    ]
  ];
  Icon($$payload, spread_props([
    { name: "moon" },
    $$sanitized_props,
    {
      iconNode,
      children: ($$payload2) => {
        $$payload2.out += `<!---->`;
        slot($$payload2, $$props, "default", {});
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
}
function Sun($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "circle",
      { "cx": "12", "cy": "12", "r": "4" }
    ],
    ["path", { "d": "M12 2v2" }],
    ["path", { "d": "M12 20v2" }],
    ["path", { "d": "m4.93 4.93 1.41 1.41" }],
    ["path", { "d": "m17.66 17.66 1.41 1.41" }],
    ["path", { "d": "M2 12h2" }],
    ["path", { "d": "M20 12h2" }],
    ["path", { "d": "m6.34 17.66-1.41 1.41" }],
    ["path", { "d": "m19.07 4.93-1.41 1.41" }]
  ];
  Icon($$payload, spread_props([
    { name: "sun" },
    $$sanitized_props,
    {
      iconNode,
      children: ($$payload2) => {
        $$payload2.out += `<!---->`;
        slot($$payload2, $$props, "default", {});
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
}
function NavBar($$payload, $$props) {
  push();
  var $$store_subs;
  let brand = fallback($$props["brand"], "Brand");
  let links = fallback($$props["links"], () => [], true);
  let sticky = fallback($$props["sticky"], true);
  let isOpen = false;
  const each_array = ensure_array_like(links);
  $$payload.out += `<nav${attr_class("navbar svelte-og9htj", void 0, { "sticky": sticky })}><div class="navbar-container svelte-og9htj"><div class="brand svelte-og9htj"><a href="/" class="brand-link svelte-og9htj">${escape_html(brand)}</a></div> <div${attr_class("links svelte-og9htj", void 0, { "open": isOpen })}><!--[-->`;
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let link = each_array[$$index];
    $$payload.out += `<a${attr("href", link.href)}${attr_class("nav-link svelte-og9htj", void 0, { "active": link.active })}>${escape_html(link.label)}</a>`;
  }
  $$payload.out += `<!--]--></div> <div class="nav-controls svelte-og9htj"><button class="theme-toggle svelte-og9htj" aria-label="Toggle theme">`;
  if (store_get($$store_subs ??= {}, "$theme", theme) === "dark") {
    $$payload.out += "<!--[-->";
    Sun($$payload, { size: 20 });
  } else {
    $$payload.out += "<!--[!-->";
    Moon($$payload, { size: 20 });
  }
  $$payload.out += `<!--]--></button> <button class="menu-toggle svelte-og9htj" aria-label="Toggle navigation menu"><span${attr_class("hamburger svelte-og9htj", void 0, { "active": isOpen })}></span></button></div></div></nav>`;
  if ($$store_subs) unsubscribe_stores($$store_subs);
  bind_props($$props, { brand, links, sticky });
  pop();
}
export {
  NavBar as N
};
