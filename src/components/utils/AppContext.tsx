import { 
  createContext, 
  Dispatch, 
  ReactNode, 
  SetStateAction, 
  useContext,
  useState 
} from 'react';
import { Profile, Post} from '@generated/types'

export interface ContextType {
    address: string | undefined;
    profile: Profile | undefined;
    posts: Post[];
    setUserAddress: Dispatch<SetStateAction<string>>;
    setProfile: Dispatch<SetStateAction<Profile | undefined>>;
    setPosts: Dispatch<SetStateAction<Post[]>>;
  }

type Props = {
  children: ReactNode;
};
  
const AppContext = createContext<ContextType>({
  address: undefined,
  profile: undefined,
  posts: [],
  setUserAddress: () => {},
  setProfile: () => {},
  setPosts: () => {}
})

export function AppWrapper({ children }: Props) {
  const [address, setUserAddress] = useState("")
  const [profile, setProfile] = useState<Profile | undefined>()
  const [posts, setPosts] = useState<Post[]>([])

  const value = {
    address,
    profile,
    posts,
    setUserAddress,
    setProfile,
    setPosts
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  return useContext(AppContext)
}
  
export default AppContext