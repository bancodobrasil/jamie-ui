import { DocumentNode, gql } from '@apollo/client';

export default class MenuService {
  static GET_LIST_MENU: DocumentNode = gql`
    query GetMenus {
      menus {
        id
        name
      }
    }
  `;

  static GET_MENU: DocumentNode = gql`
    query GetMenu($id: Int!) {
      menu(id: $id) {
        id
        name
        meta
      }
    }
  `;

  static CREATE_MENU: DocumentNode = gql`
    mutation CreateMenu($menu: CreateMenuInput!) {
      createMenu(createMenuInput: $menu) {
        id
      }
    }
  `;

  static UPDATE_MENU: DocumentNode = gql`
    mutation UpdateMenu($menu: UpdateMenuInput!) {
      updateMenu(updateMenuInput: $menu) {
        id
      }
    }
  `;

  static REMOVE_MENU: DocumentNode = gql`
    mutation RemoveMenu($id: Int!) {
      removeMenu(id: $id)
    }
  `;
}
