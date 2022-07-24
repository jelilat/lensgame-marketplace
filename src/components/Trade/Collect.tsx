import { useAppContext } from '@components/utils/AppContext'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { FC, useState, useEffect } from 'react'
import { CREATE_COLLECT_TYPED_DATA_MUTATION } from '@graphql/Mutations/Module'
import { APPROVED_ALLOWANCE } from '@graphql/Queries/Module'
import { useMutation, useLazyQuery } from '@apollo/client'
import { 
    useContractWrite, 
    useSignTypedData, 
    useAccount,
    useNetwork,
    chain as chains,
    erc20ABI
 } from 'wagmi'
import { CreateCollectBroadcastItemResult } from '@generated/types'
import omit from 'src/lib/omit'
import { utils, BigNumber } from 'ethers'
import { LensHubProxy } from 'src/abis/LensHubProxy'
import { CollectModuleSettings } from './List'

interface Props {
    filter: number | undefined
}

type CollectDetails = {
    id: string, 
    type: CollectModuleSettings
    address: string, 
    decimal: number, 
    value: string
}

const Collect: FC<Props> = ({filter}) => {
    const { posts } = useAppContext()
    const [collectDetails, setCollectDetails] = useState<CollectDetails>()
    const [callCollect, setCallCollect] = useState<boolean>()
    const [allowance, setAllowance] = useState<string>()
    const { address, isConnected } = useAccount()
    const { chain } = useNetwork()

    const { signTypedDataAsync } = useSignTypedData({
        onError(error) {
          console.error(error?.message)
        }
      })

    const approveToken = useContractWrite({
        addressOrName: collectDetails?.address!,
        contractInterface: erc20ABI,
        functionName: 'approve',
        onError(error) {
            alert(error?.message)
        },
        onSuccess() {
            toast.success('Token approved!')
        }
    })

    const { write } = useContractWrite({
        addressOrName: '0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d',
        contractInterface: LensHubProxy,
        functionName: 'collectWithSig',
        onError(error: any) {
            toast.error(error?.data?.message ?? error?.message)
            setCallCollect(false)
        },
        onSuccess(data: any) {
            toast.success('Successfully posted', data)
            setCallCollect(false)
        }
    })

    const [collectTypedData] = useMutation(CREATE_COLLECT_TYPED_DATA_MUTATION, {
        onCompleted({
            createCollectTypedData
        }: {
            createCollectTypedData: CreateCollectBroadcastItemResult
        }) {
            const { typedData } = createCollectTypedData
            const {
                profileId,
                pubId,
                data: collectData
            } = typedData?.value
            
            signTypedDataAsync({
                domain: omit(typedData?.domain, '__typename'),
                types: omit(typedData?.types, '__typename'),
                value: omit(typedData?.value, '__typename')
            }).then((signature) => {
                const { v, r, s } = utils.splitSignature(signature)
                const sig = { v, r, s, deadline: typedData.value.deadline }
                const inputStruct = {
                    collector: address,
                    profileId,
                    pubId,
                    data: collectData,
                    sig
                }

                write({ args: inputStruct })
            })
        }
    })
    
    const [approvedAllowance] = useLazyQuery(APPROVED_ALLOWANCE, {
        variables: { 
            request: {
                currencies: [collectDetails?.address!],
                collectModules: [collectDetails?.type!],
                followModules: [],
                referenceModules: []
            }
        },
        onCompleted({approvedModuleAllowanceAmount}) {console.log(approvedModuleAllowanceAmount)
            setAllowance(approvedModuleAllowanceAmount[0]?.allowance)
        }
    })

    useEffect(() => {
        const collectItem = async () => {
            if (!isConnected) {
                alert("Connect your wallet")
            } else if (chain?.id !== chains.polygon.id ) {
                alert("Connect your wallet to Polygon")
            } else {
                if (collectDetails?.type !== 'FreeCollectModuleSettings') {
                    const value = parseFloat(collectDetails?.value!); 
                    const decimal = (10**Number(collectDetails?.decimal!));
                    const amount: BigNumber = BigNumber.from(value * decimal)

                    if (!allowance) {console.log("allow check")
                        approvedAllowance()
                    } else if (BigNumber.from(allowance) >= amount) {
                        collectTypedData({
                            variables: {
                                request: {
                                    publicationId: collectDetails?.id,
                                }
                            }
                        })
                    } else {
                        approveToken.write({ args: ['0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d', amount]})
                    }
                } else {
                    collectTypedData({
                        variables: {
                            request: {
                                publicationId: collectDetails?.id,
                            }
                        }
                    })
                } 
            }
        }
        if (collectDetails?.id && callCollect) {
            collectItem()
            setCallCollect(false)
        }
    }, [callCollect, collectDetails, isConnected, address, chain, approveToken, allowance, approvedAllowance, collectTypedData])

    return (
        <>
        <div className="font-mono grid grid-cols-3 gap4 my-5 mx-10">
                {
                    (filter ? posts.slice(0, filter) : posts).map((post, index) => {
                        return (
                            <div key={index} className="p-3 inline-block">
                                <div className="">
                                    <Link href={`/post/${post.id}`}>
                                        <Image className="rounded-lg"
                                            src={post.metadata?.media[0].original?.url} width={450} height={450} alt="lensgame-post" />
                                    </Link>
                                    <div className="font-bold my-1">
                                        {
                                            post.collectModule.__typename !== "FreeCollectModuleSettings" ?
                                                post.collectModule.amount?.value + " " + post.collectModule.amount?.asset?.name : 'Free'
                                        }
                                    </div>
                                    <div className="font-bold text-xl my-1">
                                        {post.metadata?.description}
                                    </div>
                                    <div className="my-1 text-ellipsis overflow-hidden">
                                        {post.metadata?.content}
                                    </div>
                                </div>
                                <button onClick={()=> {
                                    setCollectDetails({
                                        ...collectDetails,
                                        id: posts[index].id,
                                        type: posts[index].collectModule?.__typename,
                                        address: posts[index].collectModule?.amount?.asset?.address,
                                        decimal: posts[index].collectModule?.amount?.asset?.decimals,
                                        value: posts[index].collectModule?.amount?.value
                                    })
                                    setCallCollect(true)
                                }}
                                    className="text-white rounded-lg bg-black my-3 p-3 w-full">
                                    Collect
                                </button>
                            </div>
                        )
                    })
                }
            </div>
        </>
    )
}

export default Collect