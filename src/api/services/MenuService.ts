import { DocumentNode, gql } from '@apollo/client';

export const ALL_MENU_PROPERTIES = `
id
name
mustDeferChanges
createdAt
updatedAt
version
currentRevisionId
publishedRevisionId
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
defaultTemplate {
  json
  xml
  plain
}
items {
  id
  menuId
  label
  order
  meta
  parentId
  menuId
  templateFormat
  template
  defaultTemplate {
    json
    xml
    plain
  }
  enabled
  startPublication
  endPublication
  createdAt
  updatedAt
  version
}
`;

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
        ${ALL_MENU_PROPERTIES}
      }
    }
  `;

  static CREATE_MENU: DocumentNode = gql`
    mutation CreateMenu($menu: CreateMenuInput!) {
      createMenu(createMenuInput: $menu) {
        ${ALL_MENU_PROPERTIES}
      }
    }
  `;

  static UPDATE_MENU: DocumentNode = gql`
    mutation UpdateMenu($menu: UpdateMenuInput!) {
      updateMenu(updateMenuInput: $menu) {
        ${ALL_MENU_PROPERTIES}
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
        ${ALL_MENU_PROPERTIES}
      }
    }
  `;

  static RENDER_MENU_TEMPLATE: DocumentNode = gql`
    query RenderMenuTemplate($input: RenderMenuTemplateInput!) {
      renderMenuTemplate(renderMenuTemplateInput: $input)
    }
  `;

  static RENDER_MENU_ITEM_TEMPLATE: DocumentNode = gql`
    query RenderMenuItemTemplate(
      $item: RenderMenuItemTemplateInput!
      $menu: RenderMenuTemplateInput!
    ) {
      renderMenuItemTemplate(renderMenuItemTemplateInput: $item, renderMenuTemplateInput: $menu)
    }
  `;
}
