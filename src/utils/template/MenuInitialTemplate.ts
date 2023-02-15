export default class MenuInitialTemplate {
  public static EJS = '<% const { id, name, meta, items } = menu; -%>';

  public static JSON = `${MenuInitialTemplate.EJS}
{
  "id": <%= id %>,
  "name": "<%= name %>",
  "meta": <%- meta && JSON.stringify(meta) %>,
  "items": <%- items && JSON.stringify(items) %>
}`;

  public static XML = `${MenuInitialTemplate.EJS}
<% const metaTags = (meta) => { -%>
<% return meta.map(({name, required, type}) => { -%>
<% return \`<meta name="\${name}" required="\${required}" type="\${type}" />\`; %>
<% }); %>
<% }; -%>
<% const childrenMetaTags = (meta) => { -%>
<% return Object.keys(meta).map((key) => { -%>
<% return \`<meta key="\${key}" value="\${meta[key]}" />\`; %>
<% }); %>
<% }; -%>
<% const mapChildren = (children, level) => { -%>
<% return children.map((child) => { -%>
<% const { id, label, order, meta, children } = child; -%>
<% let spaces = '  '; -%>
<% for (let i = level; i > 0; i--) { -%>
<% spaces += '  '; -%>
<% } -%>
<% return \`
\${spaces}<item id="\${id}" label="\${label}" order="\${order}">
  \${spaces}\${meta ? childrenMetaTags(meta).join(\`\\n\`) : ''}\${children?.length ? '\\n' + mapChildren(children, level + 1).join(\`\\n\`) : ''}
\${spaces}</item>\`;
%>
<% }); %>
<% }; -%>
<menu id="<%= id %>" name="<%= name %>">
  <%- meta?.length ? metaTags(meta).join('\\n  ') : '' %>
  <%- items?.length ? mapChildren(items, 0).join('\\n') : '' %>
</menu>`;

  public static PLAIN = `${MenuInitialTemplate.EJS}
id = <%= id %>;
name = "<%= name %>";
meta = <%- JSON.stringify(meta, null, 2) %>;
items = <%- JSON.stringify(items, null, 2) %>;`;
}
