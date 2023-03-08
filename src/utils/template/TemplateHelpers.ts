import { IMenuItem } from '../../types';

export default class TemplateHelpers {
  public static renderItemsXML(items: IMenuItem[]) {
    if (!items) return '';
    const renderItem = (item: IMenuItem, spaces = '    ', isChildren = false): string => {
      if (!item.enabled) return '';
      if (item.template) return item.template;
      const tag = isChildren ? 'child' : 'item';
      let itemXml = `${spaces}<${tag} id="${item.id}" label="${item.label}" order="${item.order}"`;
      if (!item.meta && !item.children) {
        itemXml += '/>';
        return itemXml;
      }
      itemXml += '>';
      if (item.meta) {
        itemXml += '\n';
        Object.keys(item.meta).forEach(key => {
          const value = item.meta[key];
          itemXml += `${spaces}  <meta key="${key}" value="${value}" />\n`;
        });
      }
      if (item.children && item.children.length) {
        itemXml += `${spaces}  <children>`;
        item.children.forEach(child => {
          itemXml += `\n${renderItem(child, `${spaces}    `, true)}`;
        });
        itemXml += `\n${spaces}  </children>\n`;
      }
      itemXml += `${spaces}</${tag}>`;
      return itemXml;
    };
    let xml = '';
    xml += `  <items>`;
    items.forEach(item => {
      xml += `\n${renderItem(item)}`;
    });
    xml += `\n  </items>`;
    return xml;
  }

  public static prettyJSON(obj: any) {
    return JSON.stringify(obj, null, 2);
  }
}
