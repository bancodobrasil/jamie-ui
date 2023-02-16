import { DocumentNode, gql } from '@apollo/client';

export default class MenuItemService {
  static GET_MENU_ITEM: DocumentNode = gql`
    query GetMenuItem($id: Int!) {
      menuItem(id: $id) {
        id
        label
        order
        meta
        parentId
        template
        templateFormat
        menu {
          id
          name
          meta
          items {
            id
            label
            order
            meta
            parentId
            template
            templateFormat
          }
        }
      }
    }
  `;
}
