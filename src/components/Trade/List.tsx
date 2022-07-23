import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { CREATE_POST_TYPED_DATA } from '@graphql/Mutations/Publication'
import { BROADCAST_MUTATION } from '@graphql/Mutations/Broadcast'
import { useAppContext } from '@components/utils/AppContext'
import { CollectModuleParams, CollectModules, CreatePostBroadcastItemResult } from '@generated/types'
import { 
    useAccount, 
    useNetwork, 
    chain as chains,
    useSignTypedData,
    useContractWrite
 } from 'wagmi'
import { utils } from 'ethers'
import toast from 'react-hot-toast'
import omit from 'src/lib/omit'
import { uploadToIPFS, uploadImageToIPFS } from 'src/lib/uploadToIPFS'
import { v4 as uuidv4 } from 'uuid'
import { InformationCircleIcon } from '@heroicons/react/outline'
import { LensHubProxy } from 'src/abis/LensHubProxy'

type CollectModuleSettings = 
    'FeeCollectModuleSettings'|
    'FreeCollectModuleSettings'|
    'LimitedFeeCollectModuleSettings'|
    'LimitedTimedFeeCollectModuleSettings'|
    'RevertCollectModuleSettings'|
    'TimedFeeCollectModuleSettings'

const List = () => {
    const { profile } = useAppContext()
    const { isConnected, address } = useAccount()
    const { chain } = useNetwork()
    const [contentURI, setContentURI] = useState<string>('');
    const [onlyFollower, setOnlyFollower] = useState<boolean>(false);
    const [collectModule, setCollectModule] = useState<{name: CollectModuleSettings, moduleParams: CollectModuleParams}>({
        name: 'FreeCollectModuleSettings',
        moduleParams: {
            freeCollectModule: {
                followerOnly: false,
            }
        }
    });
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [isListing, setIsListing] = useState<boolean>(false);
    const [content, setContent] = useState<{title: string, description: string}>({
        title: '',
        description: ''
    });
    const [image, setImage] = useState<string>('');
    const [imageMimeType, setImageMimeType] = useState<string>('');
    const [currency, setCurrency] = useState<string>('0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270');
    const [price, setPrice] = useState<string>('0');
    const [collectLimit, setCollectLimit] = useState<string>('1000')

    const { isLoading: signLoading, signTypedDataAsync } = useSignTypedData({
        onError(error) {
          toast.error(error?.message)
        }
      })

    const { write } = useContractWrite({
        addressOrName: '0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d',
        contractInterface: LensHubProxy,
        functionName: 'postWithSig',
        onError(error: any) {
            toast.error(error?.data?.message ?? error?.message)
        },
        onSuccess(data: any) {
            toast.success('Successfully posted', data)
        }
    })

    const uploadImageCallBack = async (file: File) => {
        console.log("Uploading image")
        const { path } = await uploadImageToIPFS(file)
        const imageURL = `https://ipfs.infura.io/ipfs/${path}`
        setImage(imageURL)
        return new Promise (
            (resolve, reject) => {
                resolve({
                data: {
                    link: imageURL
                }
                })
            }
        )
    }

    const updateModuleParams = () => {
        if (collectModule.name === 'FreeCollectModuleSettings') {
            setCollectModule({
                name: 'FreeCollectModuleSettings',
                moduleParams: {
                    freeCollectModule: {
                        followerOnly: onlyFollower,
                    }
                }
            })
        } else if (collectModule.name === 'FeeCollectModuleSettings') {
            setCollectModule({
                name: 'FeeCollectModuleSettings',
                moduleParams: {
                    feeCollectModule: {
                        amount: {
                            currency: currency,
                            value: price
                        },
                        referralFee: 0,
                        recipient: address,
                        followerOnly: onlyFollower
                    }
                }
            })
        } else if (collectModule.name === 'LimitedFeeCollectModuleSettings') {
            setCollectModule({
                name: 'LimitedFeeCollectModuleSettings',
                moduleParams: {
                    limitedFeeCollectModule: {
                        collectLimit: collectLimit,
                        amount: {
                            currency: currency,
                            value: price
                        },
                        referralFee: 0,
                        recipient: address,
                        followerOnly: onlyFollower
                    }
                }
            })
        } else if (collectModule.name === 'LimitedTimedFeeCollectModuleSettings') {
            setCollectModule({
                name: 'LimitedTimedFeeCollectModuleSettings',
                moduleParams: {
                    limitedTimedFeeCollectModule: {
                        collectLimit: collectLimit,
                        amount: {
                            currency: currency,
                            value: price
                        },
                        referralFee: 0,
                        recipient: address,
                        followerOnly: onlyFollower
                    }
                }
            })
        } else {
            setCollectModule({
                name: 'TimedFeeCollectModuleSettings',
                moduleParams: {
                    timedFeeCollectModule: {
                        amount: {
                            currency: currency,
                            value: price
                        },
                        referralFee: 0,
                        recipient: address,
                        followerOnly: onlyFollower
                    }
                }
            })
        }
    }

    const [createPostTypedData] = useMutation(CREATE_POST_TYPED_DATA, {
        onCompleted({
            createPostTypedData
        }: {
            createPostTypedData: CreatePostBroadcastItemResult
        }) {
            const { id, typedData } = createPostTypedData
                const {
                    profileId,
                    contentURI,
                    collectModule,
                    collectModuleInitData,
                    referenceModule,
                    referenceModuleInitData
                } = typedData?.value

                signTypedDataAsync({
                    domain: omit(typedData?.domain, '__typename'),
                    types: omit(typedData?.types, '__typename'),
                    value: omit(typedData?.value, '__typename')
                  }).then((signature) => {
                    const { v, r, s } = utils.splitSignature(signature)
                    const sig = { v, r, s, deadline: typedData.value.deadline }
                    const inputStruct = {
                      profileId,
                      contentURI,
                      collectModule,
                      collectModuleInitData,
                      referenceModule,
                      referenceModuleInitData,
                      sig
                    }

                    write({ args: inputStruct })
                })         
        }
    })

    const listItem = async () => {
        if (!isConnected) {
            alert("Connect your wallet")
        } else if (chain?.id !== chains.polygon.id ) {
            alert("Connect your wallet to Polygon Mumbai Testnet")
        } else if (profile === undefined) {
            alert("You don't have a lens profile")
        } else {
            updateModuleParams()
            console.log(collectModule)
            setIsUploading(true)
            const { path } = await uploadToIPFS({
                version: '1.0.0',
                metadata_id: uuidv4(),
                description: content?.title,
                content: content?.description,
                image: image,
                imageMimeType: imageMimeType,
                name: `Item listed by @${profile?.handle}`,
                mainContentFocus: "IMAGE",
                attributes: [
                    {
                        //fix this
                        traitType: 'string',
                        key: 'type',
                        value: 'in-game item'
                    }
                ],
                media: [{
                    item: image,
                    type: imageMimeType
                }],
                createdOn: new Date(),
                appId: 'lensgame-marketplace-test'
            })
            setIsUploading(false)
            setContentURI(`https://ipfs.infura.io/ipfs/${path}`)
            console.log("Posting")
            createPostTypedData({
                variables: {
                    request: {
                        profileId: profile?.id,
                        contentURI: contentURI,
                        collectModule: collectModule?.moduleParams,
                        referenceModule: {
                            followerOnlyReferenceModule: false
                        }
                    }
                }
            })
        }
    }

    return (
        <>
            <div className="font-mono mx-16">
                <div className="flex justify-center lg:text-3xl sm:text-sm md:text-xl font-bold">List Item</div>
                <div className="my-3 grid col-1 place-content-center">
                    <div className="w-full mt-5">
                        <label className="font-bold">Title</label><br />
                        <input 
                            className="w-full border-2 border-gray-300 rounded-lg p-2 my-3"
                            type="text" onChange={(e) => {
                                setContent({
                                    ...content,
                                    title: e.target.value
                                })
                            }} /><br />
                        <label className="font-bold">Description</label><br />
                        <textarea 
                            className="w-full h-40 border-2 border-gray-300 rounded-lg p-2 my-3"
                            onChange={(e) => {
                                setContent({
                                    ...content,
                                    description: e.target.value
                                })
                            }} /><br />
                        
                        <label className="font-bold">Upload file</label>
                        <input onChange={(e) => {
                            const file = e.target.files
                            if (file) {
                                uploadImageCallBack(file[0])
                                setImageMimeType(file[0].type)
                            }
                        }}
                            className="my-3 w-full text-sm rounded-lg border-2 border-gray-300 p-2 cursor-pointer focus:outline-none" type="file" /><br />
                        <label className="font-bold">Collect Module</label>   <br />             
                        <div className="group my-3">
                            <button id="dropdownDefault" data-dropdown-toggle="dropdown" 
                                className="focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center border-2 border-gray-700" type="button">
                                    {collectModule?.name}
                                 <svg className="ml-2 w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </button>
                            <div id="dropdown" 
                                className="invisible group-hover:visible absolute z-10 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 block">
                                <ul className="py-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefault">
                                    <li className="hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                                        <div className="flex">
                                            <button onClick={() => {
                                                setCollectModule({
                                                    ...collectModule,
                                                    name: 'FeeCollectModuleSettings'
                                                })
                                            }}
                                                className="py-2 px-4 ">Fee Collect</button>
                                            <div className="flex">
                                                <InformationCircleIcon className="peer ml-1 w-4 cursor-pointer" />
                                                <div className="invisible peer-hover:visible absolute w-full z-20 inline-block py-2 px-3 text-sm font-medium text-white bg-gray-700 rounded-lg shadow-sm transition-opacity duration-300 dark:bg-gray-700">
                                                    This collect module has no time limit, followers only unlimited mints, and an optional referral fee.
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                    <li className="hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                                        <div className="flex">
                                            <button onClick={()=> {
                                                setCollectModule({
                                                    ...collectModule,
                                                    name: 'FreeCollectModuleSettings'
                                                })
                                            }}
                                                className="block py-2 px-4">Free Collect</button>
                                            <div className="flex">
                                                <InformationCircleIcon className="peer ml-1 w-4 cursor-pointer" />
                                                <div className="invisible peer-hover:visible absolute w-full z-20 inline-block py-2 px-3 text-sm font-medium text-white bg-gray-700 rounded-lg shadow-sm transition-opacity duration-300 dark:bg-gray-700">
                                                    This module works by allowing anyone to collect with no fee or no limit or no time.
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                    <li className="hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                                        <div className="flex">
                                            <button onClick={() => {
                                                setCollectModule({
                                                    ...collectModule,
                                                    name: 'LimitedFeeCollectModuleSettings'
                                                })
                                            }}
                                                className="block py-2 px-4">Limited Fee Collect</button>
                                            <div className="flex">
                                                <InformationCircleIcon className="peer w-4 cursor-pointer" />
                                                <div className="invisible peer-hover:visible absolute w-full z-20 inline-block py-2 px-3 text-sm font-medium text-white bg-gray-700 rounded-lg shadow-sm transition-opacity duration-300 dark:bg-gray-700">
                                                    This collect module has no time limit, follower only limited mints, and an optional referral fee.
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                    <li className="hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white pr-4">
                                        <div className="flex">
                                            <button onClick={() => {
                                                setCollectModule({
                                                    ...collectModule,
                                                    name: 'LimitedTimedFeeCollectModuleSettings'
                                                })
                                            }} 
                                            className="block py-2 px-4">Limited Time Fee Collect</button>
                                            <div className="flex">
                                                <InformationCircleIcon className="peer w-4 cursor-pointer" />
                                                <div className="invisible peer-hover:visible absolute w-full z-20 inline-block py-2 px-3 text-sm font-medium text-white bg-gray-700 rounded-lg shadow-sm transition-opacity duration-300 dark:bg-gray-700">
                                                    This collect module has 24 hours with a fee and optional referral fee, follower only limited mints.
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                    <li className="hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white pr-4">
                                        <div className="flex">
                                            <button onClick={() => {
                                                setCollectModule({
                                                    ...collectModule,
                                                    name: 'TimedFeeCollectModuleSettings'
                                                })
                                            }} 
                                            className="block py-2 px-4">Timed Fee Collect</button>
                                            <div className="flex">
                                                <InformationCircleIcon className="peer ml-1 w-4 cursor-pointer" />
                                                <div className="invisible peer-hover:visible absolute w-full z-20 inline-block py-2 px-3 text-sm font-medium text-white bg-gray-700 rounded-lg shadow-sm transition-opacity duration-300 dark:bg-gray-700">
                                                    This collect module has 24 hours with a fee and optional referral fee, follower only unlimited mints.
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        {
                            collectModule?.name !== 'FreeCollectModuleSettings' &&
                            <div>
                                <div className="my-5">
                                    <label className="font-bold">Select Currency</label><br />
                                    <select onChange={(e) => setCurrency(e.target.value)}
                                        className="border-2 border-gray-300 rounded-lg p-2 my-3">
                                        <option value="0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270">Wrapped Matic</option>
                                        <option value="0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619">Wrapped Ether</option>
                                        <option value="0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174">USD Coin (POS)</option>
                                    </select>
                                </div>
                                <div className="my-5">
                                    <label className="font-bold">Amount</label><br />
                                    <input onChange={(e) => setPrice(e.target.value)}
                                        className="w-full border-2 border-gray-300 rounded-lg p-2 my-3" min="0" type="text" placeholder="1.0" />
                                </div>
                            </div>
                        }
                        {
                            (collectModule?.name === 'LimitedFeeCollectModuleSettings' || collectModule?.name === 'LimitedTimedFeeCollectModuleSettings') &&
                                <div className="my-5">
                                    <label className="font-bold">Collect Limit</label><br />
                                    <input onChange={(e) => setCollectLimit(e.target.value)}
                                        className="w-full border-2 border-gray-300 rounded-lg p-2 my-3" min="1" type="text" placeholder="1.0" />
                                </div>
                        }
                        <div className="my-5">
                            <span className="font-bold">Only Followers can collect item</span><br />
                            <label className="inline-flex relative items-center cursor-pointer my-3">
                                <input onChange={(e) => {
                                    setOnlyFollower(e.target.checked)
                                }}
                                    type="checkbox" value="" id="default-toggle" className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 dark:peer-focus:ring-gray-400 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gray-600"></div>
                            </label>
                        </div>
                        
                        <button onClick={() => listItem()}
                            className="w-full justify-center bg-gray-800 hover:bg-gray-700 text-white font-bold py-1 px-4 rounded-lg"
                        >
                            {
                                isUploading ? 
                                    "Uploading to IPFS..." : 
                                    isListing ? 
                                        "Listing..." : 
                                        "List"
                            }
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default List