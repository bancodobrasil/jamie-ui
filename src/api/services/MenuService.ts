import { DocumentNode, gql } from '@apollo/client';
import { IMenu, IMenuMeta, MenuMetaType } from '../../types';
import wrapPromise, { WrapPromise } from '../../utils/suspense/WrapPromise';

interface GetMenuPayload {
  id: number;
}
type GetMenuResponse = IMenu;

interface UpdateMenuPayload {
  name: string;
  meta: IMenuMeta[];
}
type UpdateMenuResponse = IMenu;

interface DeleteMenuPayload {
  id: number;
}
type DeleteMenuResponse = void;

export default class MenuService {
  static GET_LIST_MENU: DocumentNode = gql`
    query GetMenus {
      menus {
        id
        name
      }
    }
  `;

  static getMenu(payload: GetMenuPayload): WrapPromise<GetMenuResponse> {
    // TODO: Implement the API request
    // The Promise below simulates the loading time of the request, remove it when you implement the request itself.
    const promise = new Promise<GetMenuResponse>((resolve, reject) => {
      setTimeout(() => {
        // reject(new Error('Failed to fetch RuleSheet'));
        resolve({
          id: 1,
          name: 'Menu Mobile',
          meta: [
            {
              name: 'Responsável',
              type: MenuMetaType.TEXT,
              required: true,
            },
            {
              name: 'Código interno',
              type: MenuMetaType.NUMBER,
              required: true,
            },
            {
              name: 'Precisa de autenticação?',
              type: MenuMetaType.BOOLEAN,
              required: true,
            },
            {
              name: 'Data de expiração',
              type: MenuMetaType.DATE,
              required: false,
            },
          ],
          items: [
            {
              id: '1',
              label: 'Transferir',
              order: 1,
              meta: {
                Responsável: 'João',
                'Código interno': 123,
                'Precisa de autenticação?': true,
                'Data de expiração': null,
              },
              children: [
                {
                  id: '1.1',
                  label: 'TED',
                  order: 1,
                  meta: {
                    Responsável: 'João',
                    'Código interno': 123,
                    'Precisa de autenticação?': true,
                    'Data de expiração': null,
                  },
                },
                {
                  id: '1.2',
                  label: 'DOC',
                  order: 2,
                  meta: {
                    Responsável: 'João',
                    'Código interno': 123,
                    'Precisa de autenticação?': true,
                    'Data de expiração': null,
                  },
                },
              ],
            },
            {
              id: '2',
              label: 'Saldo',
              order: 2,
              meta: {
                Responsável: 'João',
                'Código interno': 123,
                'Precisa de autenticação?': true,
                'Data de expiração': null,
              },
            },
          ],
        });
      }, 2000);
    });
    return wrapPromise(promise);
  }

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

  static async deleteMenu(payload: DeleteMenuPayload): Promise<DeleteMenuResponse> {
    const promise = new Promise<DeleteMenuResponse>((resolve, reject) => {
      setTimeout(() => {
        // reject(new Error('Failed to create Menu'));
        resolve();
      }, 2000);
    });
    const response = await promise;
    return response;
  }
}
