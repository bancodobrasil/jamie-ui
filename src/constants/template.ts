export const EJS_INITIAL_TEMPLATE = '<% const { id, label, order, meta, children } = item; -%>';

export const JSON_INITIAL_TEMPLATE = `${EJS_INITIAL_TEMPLATE}
{
  "id": <%= id %>,
  "label": "<%= label %>",
  "order": <%= order %>,
  "meta": <%- JSON.stringify(meta) %>,
  "children": <%- children && JSON.stringify(children) %>
}`;

export const XML_INITIAL_TEMPLATE = `${EJS_INITIAL_TEMPLATE}
<% const metaTags = (meta) => { -%>
<% return Object.keys(meta).map((key) => { -%>
<% return \`<meta key="\${key}" value="\${meta[key]}" />\`; %>
<% }); %>
<% }; -%>
<% const mapChildren = (children) => { -%>
<% return children.map((child) => { -%>
<% const { id, label, order, meta } = child; -%>
<% return \`
  <item id="\${id}" label="\${label}" order="\${order}">
    \${metaTags(meta).join('\\n  ')}
  </item>\`;
%>
<% }); %>
<% }; -%>
<item id="<%= id %>" label="<%= label %>" order="<%= order %>">
  <%- meta && metaTags(meta).join('\\n  ') %>
  <%- children && mapChildren(children).join('\\n  ') %>
</item>`;

export const PLAINTEXT_INITIAL_TEMPLATE = `${EJS_INITIAL_TEMPLATE}
id = <%= id %>;
label = "<%= label %>";
order = <%= order %>;
meta = <%- JSON.stringify(meta, null, 2) %>;
children = <%- JSON.stringify(children, null, 2) %>;`;
