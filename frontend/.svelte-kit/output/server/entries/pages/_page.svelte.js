import { G as head, I as attr, F as escape_html, D as pop, A as push } from "../../chunks/index.js";
import { N as NavBar } from "../../chunks/NavBar.js";
function _page($$payload, $$props) {
  push();
  const navLinks = [
    { href: "/", label: "Home", active: true },
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
  let contactName = "";
  let contactEmail = "";
  let contactMessage = "";
  let contactSubmitting = false;
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Political Gossips - Latest Political News and Analysis</title>`;
  });
  $$payload.out += `<div class="container svelte-uxu2tw">`;
  NavBar($$payload, {
    brand: "Political Gossips",
    links: navLinks,
    sticky: true
  });
  $$payload.out += `<!----> <main><section class="featured-section glass-panel svelte-uxu2tw"><h2 class="svelte-uxu2tw">Featured Articles</h2> `;
  {
    $$payload.out += "<!--[1-->";
    $$payload.out += `<div class="loading-container"><div class="loading-spinner"></div> <p>Loading featured articles...</p></div>`;
  }
  $$payload.out += `<!--]--></section> <section class="latest-news-section glass-panel svelte-uxu2tw"><h2 class="svelte-uxu2tw">Latest News</h2> `;
  {
    $$payload.out += "<!--[1-->";
    $$payload.out += `<div class="loading-container"><div class="loading-spinner"></div> <p>Loading latest news...</p></div>`;
  }
  $$payload.out += `<!--]--></section> <section class="contact-section glass-panel svelte-uxu2tw"><h2 class="svelte-uxu2tw">Contact Us</h2> <div class="contact-content glass-card svelte-uxu2tw"><p>Have a tip or feedback? We'd love to hear from you.</p> `;
  {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> <form class="contact-form"><div class="form-group svelte-uxu2tw"><input type="text" placeholder="Your Name" required${attr("value", contactName)}${attr("disabled", contactSubmitting, true)} class="svelte-uxu2tw"></div> <div class="form-group svelte-uxu2tw"><input type="email" placeholder="Your Email" required${attr("value", contactEmail)}${attr("disabled", contactSubmitting, true)} class="svelte-uxu2tw"></div> <div class="form-group svelte-uxu2tw"><textarea placeholder="Your Message" rows="4" required${attr("disabled", contactSubmitting, true)} class="svelte-uxu2tw">`;
  const $$body = escape_html(contactMessage);
  if ($$body) {
    $$payload.out += `${$$body}`;
  }
  $$payload.out += `</textarea></div> <button type="submit" class="submit-btn svelte-uxu2tw"${attr("disabled", contactSubmitting, true)}>${escape_html("Send Message")}</button></form></div></section></main> <footer class="glass-panel svelte-uxu2tw"><div class="copyright svelte-uxu2tw">© ${escape_html((/* @__PURE__ */ new Date()).getFullYear())} Political Gossips. All rights reserved.</div></footer></div>`;
  pop();
}
export {
  _page as default
};
