import Image from 'next/image'
import Link from 'next/link'

const Home = () => {
    return (
        <>
            <div className="lg:flex md:flex sm:inline-block m-2 my-10 p-3">
                <div className="lg:w-1/2 sm:w-full md:w-3/4 my-2 mx-10 font-mono sm:justify-center">
                    <div 
                        className="lg:text-7xl sm:text-3xl md:text-5xl font-bold lg:pb-5 md:pb-2 mt-5">
                            Lensgame Marketplace
                    </div>
                    <div 
                        className="lg:text-5xl sm:text-xl mdLtext-3xl font-semibold lg:py-5 md:py-3">
                            Trade in-game items, power-ups, and more on the Lensverse
                    </div>
                    <div className="lg:flex md:flex sm:inline-block my-5">
                        <button 
                            className="text-white rounded-lg bg-black p-3 mr-3">
                            <Link href="/login">
                                Buy item
                            </Link>
                        </button>
                        <button 
                            className="text-white rounded-lg bg-black p-3">
                            <Link href="/login">
                                Sell item
                            </Link>
                        </button>
                    </div>
                </div>
                <div className="flex justify-center w-1/2">
                    <Image src="/ape.png" width={500} height={500} alt="lensgame-ape" />
                    {/* <Image className="rounded-lg"
                        src="/gameOfSilks.png" width={300} height={300} alt="lensgame-gameOfSilks" /> */}
                </div>
            </div>
            <div 
                className="flex font-mono justify-center lg:text-5xl sm:text-xl md:text-3xl font-bold">
                Explore
            </div>
        </>
    )
}

export default Home