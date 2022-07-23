import { useEffect } from 'react';
import { useAccount } from 'wagmi'
import { useAppContext } from '@components/utils/AppContext'
import { useLazyQuery } from '@apollo/client'
import { GET_DEFAULT_PROFILE } from '@graphql/Queries/Profile'
import { GET_PUBLICATIONS } from '@graphql/Queries/Publications'

const SetContext = () => {
    const { address, isConnected } = useAccount()
    const { 
        profile,
        setUserAddress, 
        setProfile,
        setPosts
      } = useAppContext();
    
     const [getProfile] = useLazyQuery(GET_DEFAULT_PROFILE, {
        variables: {
          request: {
            ethereumAddress: address
          }
        },
        fetchPolicy: 'no-cache',
        onCompleted(data) {console.log(data?.defaultProfile)
          setProfile(data?.defaultProfile);
        },
      })

      const [getPublications] = useLazyQuery(GET_PUBLICATIONS, {
        variables: {
          request: {
            profileId: profile?.id,
            publicationTypes: ["POST"],
            sources: ["lensgame-marketplace-test"]
          }
        },
        fetchPolicy: 'no-cache',
        onCompleted(data) {console.log(data)
          setPosts(data?.publications?.items);
        }
      })
    
      useEffect(() => {
        if (isConnected) {
          setUserAddress(address!);
          getProfile()
          getPublications()
        }
      }, [isConnected, address, setUserAddress, getProfile, getPublications]);
    
      return (
        <></>
      )
}

export default SetContext