export default class MenuInitialTemplate {
  public static JSON = `{{#with menu}}
{{#jsonFormatter spaces=2}}
{
  "name": "{{name}}",
  "meta": {{{json meta}}},
  "items": {{{renderItemsJSON items}}}
}
{{/jsonFormatter}}
{{/with}}`;

  public static XML = `{{#with menu}}
<menu name="{{name}}" {{~#unless (and (length meta) (length items))}}/>{{else}}>
  {{~#each meta as |meta|}}
  {{~#if meta.enabled}}

  <meta id="{{meta.id}}" name="{{meta.name}}" type="{{meta.type}}" required="{{meta.required}}" defaultValue="{{meta.defaultValue}}" />
  {{~/if}}
  {{~/each}}

{{{renderItemsXML items}}}
</menu>
{{/unless}}
{{/with}}`;

  public static PLAIN = `{{#with menu}}
name = "{{name}}";
meta = {{{json meta spaces=2}}};
items = {{{json items spaces=2}}};
{{/with}}`;
}
