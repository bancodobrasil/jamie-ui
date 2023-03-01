import { DocumentNode, gql } from '@apollo/client';

export default class MenuRevisionService {
  static CREATE_REVISION: DocumentNode = gql`
    mutation CreateMenuRevision($input: CreateMenuRevisionInput!) {
      createRevision(createMenuRevisionInput: $input) {
        id
        name
        currentRevision {
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
          menuId
          templateFormat
          template
          enabled
          startPublication
          endPublication
          createdAt
          updatedAt
          version
        }
      }
    }
  `;

  static RESTORE_REVISION: DocumentNode = gql`
    mutation RestoreMenuRevision($menuId: Int!, $revisionId: Int!) {
      restoreRevision(menuId: $menuId, revisionId: $revisionId) {
        id
        name
        currentRevision {
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
          menuId
          templateFormat
          template
          enabled
          startPublication
          endPublication
          createdAt
          updatedAt
          version
        }
      }
    }
  `;
}
