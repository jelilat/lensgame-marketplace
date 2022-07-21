import { gql } from '@apollo/client'

export const CREATE_POST_TYPED_DATA = gql`
  mutation($request: CreatePublicPostRequest!) { 
    createPostTypedData(request: $request) {
      id
      expiresAt
      typedData {
        types {
          PostWithSig {
            name
            type
          }
        }
      domain {
        name
        chainId
        version
        verifyingContract
      }
      value {
        nonce
        deadline
        profileId
        contentURI
        collectModule
        collectModuleInitData
        referenceModule
        referenceModuleInitData
      }
    }
   }
 }
`

export const CREATE_COMMENT_TYPED_DATA = gql`
    mutation($request: CreatePublicCommentRequest!) { 
        createCommentTypedData(request: $request) {
            id
            expiresAt
            typedData {
                types {
                    CommentWithSig {
                    name
                    type
                    }
                }
                domain {
                    name
                    chainId
                    version
                    verifyingContract
                }
                value {
                    nonce
                    deadline
                    profileId
                    profileIdPointed
                    pubIdPointed
                            referenceModuleData
                    contentURI
                    collectModule
                    collectModuleInitData
                    referenceModule
                    referenceModuleInitData
                }
            }
        }
    }
`

export const CREATE_MIRROR_TYPED_DATA = gql`
    mutation($request: CreateMirrorRequest!) { 
        createMirrorTypedData(request: $request) {
            id
            expiresAt
            typedData {
                types {
                    MirrorWithSig {
                    name
                    type
                    }
                }
                domain {
                name
                chainId
                version
                verifyingContract
                }
                value {
                    nonce
                    deadline
                    profileId
                    profileIdPointed
                    pubIdPointed
                            referenceModule
                    referenceModuleData
                    referenceModuleInitData
                }
            }
        }
    }
`