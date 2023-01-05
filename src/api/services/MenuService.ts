import { IPaginatedResponse, IMenu, IMenuMeta, MenuMetaType } from '../../types';
import wrapPromise, { WrapPromise } from '../../utils/suspense/WrapPromise';

interface GetListMenuPayload {
  page: number;
  limit: number;
}
type GetListMenuResponse = IPaginatedResponse<IMenu>;

interface GetMenuPayload {
  id: number;
}
type GetMenuResponse = IMenu;

interface CreateMenuPayload {
  name: string;
  meta: IMenuMeta[];
}
type CreateMenuResponse = IMenu;

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
  static getListMenu(payload: GetListMenuPayload): WrapPromise<GetListMenuResponse> {
    // TODO: Implement the API request
    // The Promise below simulates the loading time of the request, remove it when you implement the request itself.
    const promise = new Promise<GetListMenuResponse>((resolve, reject) => {
      setTimeout(() => {
        // reject(new Error('Failed to fetch RuleSheet'));
        resolve({
          data: [
            {
              id: 1,
              name: 'Menu Mobile',
              meta: [],
              items: [],
            },
            {
              id: 2,
              name: 'Menu AAPF',
              meta: [],
              items: [],
            },
          ],
          total: 2,
          page: 1,
          limit: 10,
          hasNextPage: false,
          hasPreviousPage: false,
        });
      }, 2000);
    });
    return wrapPromise(promise);
  }

  static async getListMenuSync(payload: GetListMenuPayload): Promise<GetListMenuResponse> {
    // TODO: Implement the API request
    // The Promise below simulates the loading time of the request, remove it when you implement the request itself.
    const promise = new Promise<GetListMenuResponse>((resolve, reject) => {
      setTimeout(() => {
        // reject(new Error('Failed to fetch Menu'));
        resolve({
          data: [
            {
              id: 1,
              name: 'Menu Mobile',
              meta: [],
              items: [],
            },
            {
              id: 2,
              name: 'Menu AAPF',
              meta: [],
              items: [],
            },
          ],
          total: 2,
          page: 1,
          limit: 10,
          hasNextPage: false,
          hasPreviousPage: false,
        });
      }, 2000);
    });
    const response = await promise;
    return response;
  }

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
          items: [],
        });
      }, 2000);
    });
    return wrapPromise(promise);
  }

  static async createMenu(payload: CreateMenuPayload): Promise<CreateMenuResponse> {
    const promise = new Promise<CreateMenuResponse>((resolve, reject) => {
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
