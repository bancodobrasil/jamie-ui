export default class MenuItemInitialTemplate {
  public static EJS = '<% const { id, label, order, meta, children, menu } = item; -%>';

  public static JSON = `${MenuItemInitialTemplate.EJS}
<%
  const mapMeta = (meta) => {
    return Object.entries(meta).reduce((acc, [id, value]) => {
      const { name, enabled } = menu.meta.find(m => {
        return m.id === Number(id)
      });
      if(!enabled) return acc;
      return {
        ...acc,
        [name]: value,
      };
    }, {});
  };
  const mapChildren = (children) => {
    return children.map((child) => {
      const { id, label, order, meta, children, template } = child;
      if (template) {
        return template;
      }
      return {
        id,
        label,
        order,
        meta: meta ? mapMeta(meta) : {},
        children: children?.length ? mapChildren(children) : [],
      }
    });
  };
%>
{
  "id": <%= id %>,
  "label": "<%= label %>",
  "order": <%= order %>,
  "meta": <%- meta &&  JSON.stringify(mapMeta(meta)) %>,
  "children": <%- children && JSON.stringify(mapChildren(children)) %>
}`;

  public static XML = `${MenuItemInitialTemplate.EJS}
<% 
  const metaTags = (meta) => {
    return Object.entries(meta).map(([id, value]) => {
      const { name, enabled } = menu.meta.find(m => m.id === Number(id));
      if(!enabled) return null;
      return \`<meta name="\${name}" value="\${value}" />\`
    }).filter(m => !!m);
  };
  const mapChildren = (children, level) => {
    return children.map((child) => {
      const { id, label, order, meta, children, template } = child;
      let spaces = '  ';
      for (let i = level; i > 0; i--) {
        spaces += '  ';
      }
      if (template) {
        const formattedTemplate = template.split('\\n').map(chunk => spaces + '  ' + chunk).join('\\n')
        return formattedTemplate;
      }
      let item = spaces + \`  <item id="\${id}" label="\${label}" order="\${order}">\\n\`
      if (meta) {
        item += spaces + '    ' + metaTags(meta).join('\\n    ' + spaces) + '\\n';
      }
      if (children?.length) {
        item += spaces + '    <children>\\n';
        item += mapChildren(children, level + 2).join('\\n') + '\\n';
        item += spaces + '    </children>\\n';
      }
      item += spaces + '  </item>';
      return item
    });
  };
-%>
<item id="<%= id %>" label="<%= label %>" order="<%= order %>">
<%- meta && '  ' + metaTags(meta).join('\\n  ') + '\\n' -%>
<% if(children?.length) { -%>
  <children>
<%- mapChildren(children, 0).join('\\n') %>
  </children>
<% } -%>
</item>`;

  public static PLAIN = `${MenuItemInitialTemplate.EJS}
<%
  const mapChildren = (children) => {
    return children.map(child => {
      const { id, label, order, meta, children, template } = child;
      if (template) {
        return template;
      }
      return {
        id,
        label,
        order,
        meta,
        children: children?.length ? mapChildren(children) : undefined,
      };
    });
  };
%>
id = <%= id %>;
label = "<%= label %>";
order = <%= order %>;
meta = <%- JSON.stringify(meta, null, 2) %>;
children = <%- children?.length ? JSON.stringify(mapChildren(children), null, 2) : [] %>;`;
}
