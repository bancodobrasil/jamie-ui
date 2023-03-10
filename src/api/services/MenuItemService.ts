import { DocumentNode, gql } from '@apollo/client';

export default class MenuItemService {
  static GET_MENU_ITEM: DocumentNode = gql`
    query GetMenuItem($id: Int!, $menuId: Int!) {
      menuItem(id: $id, menuId: $menuId) {
        id
        menuId
        label
        order
        meta
        parentId
        template
        templateFormat
        defaultTemplate {
          json
          xml
          plain
        }
        enabled
        startPublication
        endPublication
        menu {
          id
          name
          meta {
            id
            name
            type
            order
            required
            enabled
            defaultValue
          }
          templateFormat
          items {
            id
            menuId
            label
            order
            meta
            parentId
            template
            templateFormat
            enabled
            startPublication
            endPublication
          }
        }
      }
    }
  `;
}
