import Image from 'next/image'
import Link from 'next/link'
import { Modal } from '@components/UI/Modal'
import { useState, useEffect } from 'react'
import Connect from './Connect'
import { UserCircleIcon, UserIcon, LogoutIcon } from '@heroicons/react/outline'
import { useAccount, useSwitchNetwork, useNetwork, chain as chains } from 'wagmi'
import Cookies from 'js-cookie';
import LogIn from './LogIn'
import SetContext from '@components/utils/SetContext'
import { useAppContext } from '@components/utils/AppContext'
import { useRouter } from 'next/router'

const Header = () => {
    const { isConnected } = useAccount()
    const { switchNetwork } = useSwitchNetwork()
    const { chain } = useNetwork()
    const [showConnectModal, setShowConnectModal] = useState(false)
    const [loggedIn, setLoggedIn] = useState(false)
    const { profile } = useAppContext()

    useEffect(()=>{
        const accessToken = Cookies.get('accessToken')
        if (accessToken !== undefined) {
            setLoggedIn(true);
        }

        if (chain?.id !== chains.polygon.id) {console.log(chain?.id, chains.polygon.id)
            switchNetwork?.(chains.polygon.id)
        }
    }, [loggedIn, switchNetwork, chain])

    const logout = () => {
        Cookies.remove('accessToken')
        Cookies.remove('refreshToken')
        window.location.reload()
    }

    return (
        <>
        <SetContext />
        <div className="flex my-5 mx-14 border-b-2 p-1 font-mono">
            <div className="w-1/5 cursor-pointer">
                <Link href="/">
                    <Image src="/lensgame.png" width={30} height={30} alt="lensgame-marketplace" />
                </Link>
            </div>
            <div className="w-3/5 flex justify-center">
                <div className={`mx-1 p-2 ${useRouter().pathname === '/play' ?
                            "bg-gray-200 rounded-lg" : null}`}>
                    <Link href="/play">
                        Play
                    </Link>
                </div>
                <div className={`mx-1 p-2 ${useRouter().pathname === '/list' ?
                            "bg-gray-200 rounded-lg" : null}`}>
                    <Link href="/list">
                        List
                    </Link>
                </div>
                <div className={`mx-1 p-2 ${useRouter().pathname === '/collect' ?
                            "bg-gray-200 rounded-lg" : null}`}>
                    <Link href="/collect">
                        Collect
                    </Link>
                </div>
            </div>
            <div className="w-1/5 ">
                {
                    isConnected ?
                        <div className="group float-right">
                            {
                                !profile?.picture?.original?.url?
                                    <UserCircleIcon className="w-8" /> 
                                    : <Image src={profile?.picture?.original?.url} width={30} height={30} alt="lensgame-user" />
                            }
                            <div 
                                className="right-20 top-12 rounded-lg border-2 bg-gray-100 invisible group-hover:visible inline-block absolute z-10 py-2 shadow-sm transition-opacity duration-300 w-48">
                                {
                                    profile && <div className="border-b-2 px-5 p-2">
                                                    Logged in as @{profile?.handle}
                                                </div>
                                }
                                <Link
                                    href="/profile">
                                  <div className="cursor-pointer flex shrink p-1 my-2 px-5">
                                     <UserIcon className="w-5 pr-1 mr-1" />Profile
                                  </div>
                                </Link>
                                {
                                    loggedIn ?
                                    <div className="flex shrink p-1 my-2 px-5 cursor-pointer">
                                        <LogoutIcon className="w-5 pr-1 mr-1" />
                                        <button
                                            onClick={() => logout()}
                                        >
                                            Logout
                                        </button>
                                    </div>
                                    :     <div className="flex shrink p-1 my-2 px-5 cursor-pointer">
                                            <div className="pr-1 pt-1 mr-1">
                                                <Image src="/lens.png" width={20} height={20} alt="lens-logo" />
                                            </div>
                                            <button
                                                onClick={() => setShowConnectModal(true)}
                                            >
                                                Login
                                                <Modal
                                                    title="Log in to Lensverse"
                                                    show={showConnectModal}
                                                    onClose={() => setShowConnectModal(false)}
                                                >
                                                    <LogIn />
                                                </Modal>
                                            </button>
                                        </div>
                                }
                                
                            </div>
                        </div>
                        : <button className="float-right rounded-lg bg-black text-white px-2 py-1"
                        onClick={() => setShowConnectModal(true)}
                    >
                        Connect Wallet
                        <Modal
                            title="Connect Wallet"
                            show={showConnectModal}
                            onClose={() => setShowConnectModal(false)}
                        >
                            <Connect />
                        </Modal>
                    </button>
                }
            </div>
        </div>
        </>
    )
}

export default Header