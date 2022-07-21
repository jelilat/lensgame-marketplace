import React, { FC } from 'react';
import { AUTHENTICATION } from '@graphql/Mutations/Authenticate';
import { GET_CHALLENGE } from '@graphql/Queries/Authenticate';
import { useMutation, useLazyQuery } from '@apollo/client';
import { useAccount, useSignMessage } from 'wagmi';
import Cookies, { CookieAttributes } from 'js-cookie';

const LogIn: FC = () => {
    const { address } = useAccount();
    const { signMessageAsync, isLoading: signLoading } = useSignMessage();
    const COOKIE_CONFIG: CookieAttributes = {
        sameSite: 'None',
        secure: true,
        expires: 360
      }


    const [getChallenge, ] = useLazyQuery(GET_CHALLENGE, {
       variables: { request: {
           address: address,
       }},
       fetchPolicy:'no-cache',
       onCompleted(data){
              console.log(data);    
       }
    })

   const [authenticate] = useMutation(AUTHENTICATION, {
        fetchPolicy:'no-cache',
        onCompleted(data){
                console.log(data);    
          }
   })

    return (
        <>
         <div className="grid-rows-4 m-5 dark:text-white">
            <button 
                className="w-full h-12 px-6 my-2 text-gray-100 transition-colors duration-150 bg-black dark:text-black dark:bg-white rounded-lg focus:shadow-outline hover:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white"
                onClick={()=>{
                    getChallenge()
                    .then(({data}) => {
                        signMessageAsync({message: data?.challenge?.text})  
                        .then(async (signature) => {
                            await authenticate({
                                variables: {
                                    request: {
                                        address: address, signature
                                    }
                                }
                            })
                            .then((res) => {
                                Cookies.set(
                                    'accessToken',
                                    res.data.authenticate.accessToken,
                                    COOKIE_CONFIG
                                )
                                Cookies.set(
                                    'refreshToken',
                                    res.data.authenticate.refreshToken,
                                    COOKIE_CONFIG
                                )
                                window.location.reload()
                            })
                        })
                    })
                }}
            >
            Login 
            </button>
        </div>         
        </>
    )
}

export default LogIn