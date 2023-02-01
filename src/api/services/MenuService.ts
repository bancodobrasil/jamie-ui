import { DocumentNode, gql } from '@apollo/client';
import { IMenu, IMenuMeta } from '../../types';

interface UpdateMenuPayload {
  name: string;
  meta: IMenuMeta[];
}
type UpdateMenuResponse = IMenu;

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

  static async updateMenu(payload: UpdateMenuPayload): Promise<UpdateMenuResponse> {
    const promise = new Promise<UpdateMenuResponse>((resolve, reject) => {
      setTimeout(() => {
        // reject(new Error('Failed to create Menu'));
        resolve({
          id: 1,
          name: 'Menu Mobile',
          meta: [],
          items: [],
        });
      }, 2000);
    });
    const response = await promise;
    return response;
  }

  static REMOVE_MENU: DocumentNode = gql`
    mutation RemoveMenu($id: Int!) {
      removeMenu(id: $id)
    }
  `;
}
