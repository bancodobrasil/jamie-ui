import React from 'react';
import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { EditMenu, TAB_BASIC_INFO, TAB_ITEMS, TAB_ATTRIBUTES, TAB_TEMPLATE } from './Edit';
import MenuService from '../../../api/services/MenuService';

jest.mock('../Items', () => ({
  ItemsPreview: () => <div>ItemsPreview</div>,
}));

jest.mock('../EditTemplate', () => ({
  EditTemplateMenu: () => <div>EditTemplateMenu</div>,
}));

jest.mock('../../../components/Menu/Forms/BasicInfo', () => ({
  FormBasicInfo: () => <div>FormBasicInfo</div>,
}));

jest.mock('../../../components/Menu/Forms/Attributes/FormAttributes', () => ({
  FormAttributes: () => <div>FormAttributes</div>,
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    id: 1,
  }),
}));

const apiMocks = [
  {
    request: {
      query: MenuService.GET_MENU,
      variables: { id: 1 },
    },
    result: {
      data: {
        menu: {
          id: 1,
          name: 'Menu 1',
          mustDeferChanges: false,
          hasConditions: false,
          parameters: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: 1,
          currentRevisionId: null,
          publishedRevisionId: null,
          currentRevision: null,
          publishedRevision: null,
          revisions: [],
          meta: [],
          template: null,
          templateFormat: null,
          defaultTemplate: null,
          items: [],
        },
      },
    },
  },
];

describe('EditMenu', () => {
  test('items tab must be selected by default on first render', async () => {
    // ARRANGE
    const route = '/menu/edit/1';

    render(
      <MockedProvider mocks={apiMocks} addTypename={false}>
        <MemoryRouter initialEntries={[route]}>
          <EditMenu />
        </MemoryRouter>
      </MockedProvider>,
    );

    // ACT
    expect(await screen.findByTestId('menu-edit')).toBeDefined();
    // ...

    // ASSERT
    expect(await screen.findByTestId(TAB_ITEMS)).toHaveClass('Mui-selected');
    expect(await screen.findByTestId(TAB_BASIC_INFO)).not.toHaveClass('Mui-selected');
    expect(await screen.findByTestId(TAB_ATTRIBUTES)).not.toHaveClass('Mui-selected');
    expect(await screen.findByTestId(TAB_TEMPLATE)).not.toHaveClass('Mui-selected');
  });
});
