import { gql } from '@apollo/client'

export const CREATE_FOLLOW_TYPED_DATA = gql `
    mutation CreateFollowTypedData ($request: FollowRequest!) {
        createFollowTypedData(request: $request) {
            id
            expiresAt
            typedData {
                domain {
                name
                chainId
                version
                verifyingContract
                }
                types {
                FollowWithSig {
                    name
                    type
                }
                }
                value {
                nonce
                deadline
                profileIds
                datas
                }
            }
        }
    }
  `

export const CREATE_UNFOLLOW_TYPED_DATA = gql `
  mutation($request: UnfollowRequest!) { 
    createUnfollowTypedData(request: $request) {
      id
      expiresAt
      typedData {
        domain {
          name
          chainId
          version
          verifyingContract
        }
        types {
          BurnWithSig {
            name
            type
          }
        }
        value {
          nonce
          deadline
          tokenId
        }
      }
    }
 }
`