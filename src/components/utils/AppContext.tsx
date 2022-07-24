import { 
  createContext, 
  Dispatch, 
  ReactNode, 
  SetStateAction, 
  useContext,
  useState 
} from 'react';
import { Profile, Publication } from '@generated/types'

export interface ContextType {
    address: string | undefined;
    profile: Profile | undefined;
    posts: any[];
    setUserAddress: Dispatch<SetStateAction<string>>;
    setProfile: Dispatch<SetStateAction<Profile | undefined>>;
    setPosts: Dispatch<SetStateAction<any[]>>;
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
  const [posts, setPosts] = useState<any[]>([])

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