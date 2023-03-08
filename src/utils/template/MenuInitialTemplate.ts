export default class MenuInitialTemplate {
  public static JSON = `{
  "id": {{id}},
  "name": "{{name}}",
  "meta": {{{json meta spaces=2}}},
  "items": {{{json items spaces=2}}}
}`;

  public static XML = `<menu id="{{id}}" name="{{name}}" {{~#unless (and (length meta) (length items))}}/>{{else}}>
  {{~#each meta as |meta|}}
  {{~#if meta.enabled}}

  <meta id="{{meta.id}}" name="{{meta.name}}" type="{{meta.type}}" required="{{meta.required}}" defaultValue="{{meta.defaultValue}}" />
  {{~/if}}
  {{~/each}}

{{{renderItemsXML items}}}
</menu>
{{/unless}}`;

  public static PLAIN = `id = {{id}};
name = "{{name}}";
meta = {{{json meta spaces=2}}};
items = {{{json items spaces=2}}};`;
}
