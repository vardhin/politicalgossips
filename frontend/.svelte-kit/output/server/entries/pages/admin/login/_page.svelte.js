import { G as head, J as attr_class, F as escape_html, I as attr, D as pop, A as push } from "../../../../chunks/index.js";
import "../../../../chunks/client.js";
function _page($$payload, $$props) {
  push();
  let username = "";
  let password = "";
  let loading = false;
  let backendStatus = "Checking...";
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Admin Login - Political Gossips</title>`;
  });
  $$payload.out += `<div class="login-container svelte-12mildj"><div class="login-card glass-panel svelte-12mildj"><h1 class="svelte-12mildj">Admin Login</h1> <div${attr_class("backend-status svelte-12mildj", void 0, {
    "error": backendStatus.includes("unavailable")
  })}>${escape_html(backendStatus)}</div> `;
  {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> <form><div class="form-group svelte-12mildj"><label for="username" class="svelte-12mildj">Username</label> <input type="text" id="username"${attr("value", username)} required${attr("disabled", loading, true)} class="svelte-12mildj"></div> <div class="form-group svelte-12mildj"><label for="password" class="svelte-12mildj">Password</label> <input type="password" id="password"${attr("value", password)} required${attr("disabled", loading, true)} class="svelte-12mildj"></div> <button type="submit" class="login-btn svelte-12mildj"${attr("disabled", loading, true)}>${escape_html("Login")}</button></form> <div class="back-link svelte-12mildj"><a href="/" class="svelte-12mildj">Back to Home</a></div></div></div>`;
  pop();
}
export {
  _page as default
};
