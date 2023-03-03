import { DocumentNode, gql } from '@apollo/client';
import { ALL_MENU_PROPERTIES } from './MenuService';

export default class MenuRevisionService {
  static CREATE_REVISION: DocumentNode = gql`
    mutation CreateMenuRevision($input: CreateMenuRevisionInput!) {
      createRevision(createMenuRevisionInput: $input) {
        ${ALL_MENU_PROPERTIES}
      }
    }
  `;

  static RESTORE_REVISION: DocumentNode = gql`
    mutation RestoreMenuRevision($menuId: Int!, $revisionId: Int!) {
      restoreRevision(menuId: $menuId, revisionId: $revisionId) {
        ${ALL_MENU_PROPERTIES}
      }
    }
  `;

  static PUBLISH_REVISION: DocumentNode = gql`
    mutation PublishMenuRevision($menuId: Int!, $revisionId: Int!) {
      publishRevision(menuId: $menuId, revisionId: $revisionId) {
        ${ALL_MENU_PROPERTIES}
      }
    }
  `;
}
