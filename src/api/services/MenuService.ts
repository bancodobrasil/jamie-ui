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
            createdAt
            updatedAt
            currentRevisionId
            publishedRevisionId
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
        meta {
          id
          name
          type
          order
          required
          enabled
          defaultValue
        }
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
          enabled
          startPublication
          endPublication
        }
        currentRevision {
          id
          description
        }
        publishedRevision {
          id
          description
        }
        createdAt
        updatedAt
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
        meta {
          id
          name
          type
          order
          required
          enabled
          defaultValue
        }
        items {
          id
          label
          order
          meta
          parentId
          enabled
          startPublication
          endPublication
        }
      }
    }
  `;

  static REMOVE_MENU: DocumentNode = gql`
    mutation RemoveMenu($id: Int!) {
      removeMenu(id: $id)
    }
  `;

  static GET_MENU_REVISIONS: DocumentNode = gql`
    query GetMenuRevisions($id: Int!) {
      menu(id: $id) {
        id
        name
        currentRevision {
          id
          description
          createdAt
          snapshot
        }
        publishedRevision {
          id
          description
          createdAt
          snapshot
        }
        revisions {
          id
          description
          createdAt
          snapshot
        }
        meta {
          id
          name
          type
          order
          required
          enabled
          defaultValue
        }
        template
        templateFormat
        items {
          id
          label
          order
          meta
          parentId
          templateFormat
          template
          enabled
          startPublication
          endPublication
        }
      }
    }
  `;
}
