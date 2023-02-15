export default class MenuItemInitialTemplate {
  public static EJS = '<% const { id, label, order, meta, children } = item; -%>';

  public static JSON = `${MenuItemInitialTemplate.EJS}
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
  "label": "<%= label %>",
  "order": <%= order %>,
  "meta": <%- meta &&  JSON.stringify(meta) %>,
  "children": <%- children && JSON.stringify(mapChildren(children)) %>
}`;

  public static XML = `${MenuItemInitialTemplate.EJS}
<% const metaTags = (meta) => { -%>
<% return Object.keys(meta).map((key) => { -%>
<% return \`<meta key="\${key}" value="\${meta[key]}" />\`; %>
<% }); %>
<% }; -%>
<% const mapChildren = (children) => { -%>
<% return children.map((child) => { -%>
<% const { id, label, order, meta } = child; -%>
<% return \`    <item id="\${id}" label="\${label}" order="\${order}">
      \${metaTags(meta).join('\\n    ')}
    </item>\`;
%>
<% }); %>
<% }; -%>
<item id="<%= id %>" label="<%= label %>" order="<%= order %>">
<%- meta && '  ' + metaTags(meta).join('\\n  ') + '\\n' -%>
<% if(children?.length) { -%>
  <children>
<%- mapChildren(children).join('\\n') %>
  </children>
<% } -%>
</item>`;

  public static PLAIN = `${MenuItemInitialTemplate.EJS}
id = <%= id %>;
label = "<%= label %>";
order = <%= order %>;
meta = <%- JSON.stringify(meta, null, 2) %>;
children = <%- JSON.stringify(children, null, 2) %>;`;
}
