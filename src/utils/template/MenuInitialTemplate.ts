export default class MenuInitialTemplate {
  public static EJS = '<% const { id, name, meta, items } = menu; -%>';

  public static JSON = `${MenuInitialTemplate.EJS}
<%
  const mapChildrenMeta = (meta) => {
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
        meta: meta ? mapChildrenMeta(meta) : {},
        children: children?.length ? mapChildren(children) : [],
      }
    });
  };
%>
{
  "id": <%= id %>,
  "name": "<%= name %>",
  "meta": <%- meta && JSON.stringify(meta) %>,
  "items": <%- items && JSON.stringify(mapChildren(items)) %>
}`;

  public static XML = `${MenuInitialTemplate.EJS}
<% 
  const metaTags = (meta) => {
    return meta.map(({id, name, type, required, order, enabled, defaultValue}) => {
      let item = \`<meta id="\${id}" name="\${name}" type="\${type}" required="\${required}" order="\${order}" enabled="\${enabled}" \`;
      defaultValue && (item += \`defaultValue="\${defaultValue}" \`);
      item += '/>';
      return item;
    })
  };
  const childrenMetaTags = (meta) => {
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
        item += spaces + '    ' + childrenMetaTags(meta).join('\\n    ' + spaces) + '\\n';
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
<menu id="<%= id %>" name="<%= name %>">
<%- meta?.length ? '  ' + metaTags(meta).join('\\n  ') + '\\n' : '' -%>
<% if(items?.length) { -%>
  <items>
<%- mapChildren(items, 0).join('\\n') %>
  </items>
<% } -%>
</menu>`;

  public static PLAIN = `${MenuInitialTemplate.EJS}
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
name = "<%= name %>";
meta = <%- JSON.stringify(meta, null, 2) %>;
items = <%- items?.length ? JSON.stringify(mapChildren(items), null, 2) : [] %>;`;
}
