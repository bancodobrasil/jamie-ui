import { IPaginatedResponse, IMenu } from '../../types';
import wrapPromise, { WrapPromise } from '../../utils/suspense/WrapPromise';

interface GetListMenuPayload {
  page: number;
  limit: number;
}
type GetListMenuResponse = IPaginatedResponse<IMenu>;

interface CreateMenuPayload {
  name: string;
}
type CreateMenuResponse = IMenu;

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
            },
            {
              id: 2,
              name: 'Menu AAPF',
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
            },
            {
              id: 2,
              name: 'Menu AAPF',
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

  static async createMenu(payload: CreateMenuPayload): Promise<CreateMenuResponse> {
    const promise = new Promise<CreateMenuResponse>((resolve, reject) => {
      setTimeout(() => {
        // reject(new Error('Failed to create Menu'));
        resolve({
          id: 1,
          name: 'Menu Mobile',
        });
      }, 2000);
    });
    const response = await promise;
    return response;
  }
}
