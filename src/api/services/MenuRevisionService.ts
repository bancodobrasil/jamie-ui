import { DocumentNode, gql } from '@apollo/client';

export default class MenuRevisionService {
  static CREATE_REVISION: DocumentNode = gql`
    mutation CreateMenuRevision($input: CreateMenuRevisionInput!) {
      createRevision(createMenuRevisionInput: $input) {
        id
      }
    }
  `;
}
