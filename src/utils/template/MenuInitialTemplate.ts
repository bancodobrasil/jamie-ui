export default class MenuInitialTemplate {
  public static EJS = '<% const { id, name, meta, items } = menu; -%>';

  public static JSON = `${MenuInitialTemplate.EJS}
<% const mapChildren = (children) => { -%>
  <%_ return children.map((child) => { -%>
    <%_ const { id, label, order, meta, children } = child; -%>
    <%_ return {
      id,
      label,
      order,
      meta,
      children: children?.length ? mapChildren(children) : [],
    }
    %>
  <%_ }); %>
<% }; -%>
{
  "id": <%= id %>,
  "name": "<%= name %>",
  "meta": <%- meta && JSON.stringify(meta) %>,
  "items": <%- items && JSON.stringify(mapChildren(items)) %>
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
<% let item = \`  \${spaces}<item id="\${id}" label="\${label}" order="\${order}">\\n\` -%>
<% if (meta) {
  item += \`\${spaces}    \${childrenMetaTags(meta).join('\\n    ' + spaces)}\\n\`;
} -%>
<% if (children?.length) {
  item += \`\${spaces}    <children>
\${mapChildren(children, level + 2).join('\\n')}
\${spaces}    </children>\\n\`;
} -%>
<% item += \`  \${spaces}</item>\`; -%>
<% return item; %>
<% }); %>
<% }; -%>
<menu id="<%= id %>" name="<%= name %>">
<%- meta?.length ? '  ' + metaTags(meta).join('\\n  ') + '\\n' : '' -%>
<% if(items?.length) { -%>
  <items>
<%- mapChildren(items, 0).join('\\n') %>
  </items>
<% } -%>
</menu>`;

  public static PLAIN = `${MenuInitialTemplate.EJS}
id = <%= id %>;
name = "<%= name %>";
meta = <%- JSON.stringify(meta, null, 2) %>;
items = <%- JSON.stringify(items, null, 2) %>;`;
}
