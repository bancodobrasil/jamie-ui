export const EJS_INITIAL_TEMPLATE = '<% const { id, label, order, meta, children } = item; -%>';

export const JSON_INITIAL_TEMPLATE = `${EJS_INITIAL_TEMPLATE}
{
  "id": <%= id %>,
  "label": "<%= label %>",
  "order": <%= order %>,
  "meta": <%= JSON.stringify(meta) %>,
  "children": <%= JSON.stringify(children) %>
}`;

export const XML_INITIAL_TEMPLATE = `${EJS_INITIAL_TEMPLATE}
<% const metaTags = (meta) => { -%>
  <% return Object.keys(meta).map((key) => { -%>
    <% return \`<meta key="\${key}" value="\${meta[key]}" />\`; -%>
  <% }); -%>
<% }; -%>
<% const mapChildren = (children) => { -%>
  <% return children.map((child) => { -%>
    <% const { id, label, order, meta, children } = child; -%>
    <%
      return \`<item id="\${id}" label="\${label}" order="\${order}">
      \${metaTags(meta)}
      \${mapChildren(children)}
      </item>\`;
    -%>
  <% }); -%>
<% }; -%>
<item id="<%= id %>" label="<%= label %>" order="<%= order %>">
  <%= metaTags(meta) %>
  <%= mapChildren(children) %>
</item>`;

export const PLAINTEXT_INITIAL_TEMPLATE = `${EJS_INITIAL_TEMPLATE}
id = <%= id %>;
label = <%= label %>;
order = <%= order %>;
meta = <%= JSON.stringify(meta) %>;
children = <%= JSON.stringify(children) %>;`;
