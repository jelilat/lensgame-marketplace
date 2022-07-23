import { create } from 'ipfs-http-client'

const client = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https'
})

export const uploadToIPFS = async (data: any) => {
  return await client.add(JSON.stringify(data))
}

export const uploadImageToIPFS = async (data: any) => {
  return await client.add(data)
}
