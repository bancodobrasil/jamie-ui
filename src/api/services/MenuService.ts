import { DocumentNode, gql } from '@apollo/client';

export default class MenuService {
  static LIST_MENUS: DocumentNode = gql`
    query ListMenus(
      $first: Int
      $after: String
      $last: Int
      $before: String
      $sort: MenuSort
      $direction: Direction
    ) {
      menus(
        first: $first
        after: $after
        last: $last
        before: $before
        sort: $sort
        direction: $direction
      ) {
        edges {
          node {
            id
            name
          }
          cursor
        }
        pageInfo {
          startCursor
          endCursor
          hasNextPage
          hasPreviousPage
        }
        totalCount
      }
    }
  `;

  static GET_MENU: DocumentNode = gql`
    query GetMenu($id: Int!) {
      menu(id: $id) {
        id
        name
        meta
        template
        templateFormat
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
        name
        meta
        items {
          id
          label
          order
          meta
          parentId
        }
      }
    }
  `;

  static REMOVE_MENU: DocumentNode = gql`
    mutation RemoveMenu($id: Int!) {
      removeMenu(id: $id)
    }
  `;
}
