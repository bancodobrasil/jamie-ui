import { DocumentNode, gql } from '@apollo/client';

export default class MenuRevisionService {
  static CREATE_REVISION: DocumentNode = gql`
    mutation CreateMenuRevision($input: CreateMenuRevisionInput!) {
      createRevision(createMenuRevisionInput: $input) {
        id
      }
    }
  `;

  static RESTORE_REVISION: DocumentNode = gql`
    mutation RestoreMenuRevision($menuId: Int!, $revisionId: Int!) {
      restoreRevision(menuId: $menuId, revisionId: $revisionId) {
        id
      }
    }
  `;
}
