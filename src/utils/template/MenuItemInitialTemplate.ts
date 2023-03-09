export default class MenuItemInitialTemplate {
  public static EJS = '<% const { id, label, order, meta, children, menu } = item; -%>';

  public static JSON = `{{#with item}}
{{#jsonFormatter spaces=2}}
{
  "id": {{id}},
  "label": "{{label}}",
  "order": {{order}},
  "meta": {{{json meta}}},
  "children": {{{renderItemsJSON children}}}
}
{{/jsonFormatter}}
{{/with}}`;

  public static XML = `{{#with item}}
<item id="{{id}}" label="{{label}}" order="{{order}}" {{~#unless (and meta (length children))}}/>{{else}}>
  {{~#each meta as |meta|}}

  <meta key="{{@key}}" value="{{meta}}" />
  {{~/each}}

{{{renderItemsXML children isChildren=true}}}
</item>
{{/unless}}
{{/with}}`;

  public static PLAIN = `{{#with item}}
id = {{id}};
label = "{{label}}";
meta = {{{json meta spaces=2}}};
children = {{{json children spaces=2}}};
{{/with}}`;
}
