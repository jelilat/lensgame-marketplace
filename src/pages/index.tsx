import dynamic from 'next/dynamic'

const Homepage = dynamic(
    () => import('@components/Body'),
    { ssr: false }
)

export default Homepage
