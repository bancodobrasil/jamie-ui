export const EJS_INITIAL_TEMPLATE = `
<% const { id, label, order, meta, children } = item; %>
<% const mapChildren = (children) => { %>
  <% return children.map((child) => { %>
    <% const { id, label, order, meta, children } = child; %>
    <% return { id, label, order, meta, children: mapChildren(children) }; %>
  <% }); %>
<% }; %>
`;

export const JSON_INITIAL_TEMPLATE = `
${EJS_INITIAL_TEMPLATE}
{
  "id": <%= id %>,
  "label": "<%= label %>",
  "order": <%= order %>,
  "meta": <%= JSON.stringify(meta) %>,
  "children": <%= JSON.stringify(mapChildren(children)) %>
}
`;
