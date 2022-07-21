import { gql } from '@apollo/client'

export const MODULE_APPROVAL_DATA = gql`
  query($request: GenerateModuleCurrencyApprovalDataRequest!) {
    generateModuleCurrencyApprovalData(request: $request) {
      to
      from
      data
    }
  }
`