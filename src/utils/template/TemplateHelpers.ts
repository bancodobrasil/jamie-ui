/* eslint-disable prefer-rest-params */
import Handlebars from 'handlebars';
import { IMenuItem } from '../../types';

export default class TemplateHelpers {
  public static logicOperators = {
    eq: (v1, v2) => v1 === v2,
    ne: (v1, v2) => v1 !== v2,
    lt: (v1, v2) => v1 < v2,
    gt: (v1, v2) => v1 > v2,
    lte: (v1, v2) => v1 <= v2,
    gte: (v1, v2) => v1 >= v2,
    and() {
      return Array.prototype.every.call(arguments, Boolean);
    },
    or() {
      return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
    },
  };

  public static getLength = v => v?.length;

  public static json(context: any, options: Handlebars.HelperOptions) {
    return JSON.stringify(context, null, options.hash.spaces);
  }

  public static renderItemsXML(items: IMenuItem[]) {
    if (!items || !items.length) return '';
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
}
