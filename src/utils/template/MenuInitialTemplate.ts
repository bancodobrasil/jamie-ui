export default class MenuInitialTemplate {
  public static JSON = `{
  "id": {{id}},
  "name": "{{name}}",
  "meta": {{{prettyJSON meta}}},
  "items": {{{prettyJSON items}}}
}
`;

  public static XML = `<menu id="{{id}}" name="{{name}}">
  {{~#each meta as |meta|}}
  {{~#if meta.enabled}}

  <meta id="{{meta.id}}" name="{{meta.name}}" type="{{meta.type}}" required="{{meta.required}}" defaultValue="{{meta.defaultValue}}" />
  {{~/if}}
  {{~/each}}

{{{renderItemsXML items}}}
</menu>`;

  public static PLAIN = `id = {{id}};
name = "{{name}}";
meta = {{{prettyJSON meta}}};
items = {{{prettyJSON items}}};`;
}
