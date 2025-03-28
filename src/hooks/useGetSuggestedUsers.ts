import  { useEffect, useState } from 'react'
import useAuthStore from '../store/authStore'
import useShowMessage from './useShowMessage'
import {collection, where, orderBy, limit, query, getDocs} from  'firebase/firestore'
import { db } from '../services/firebase'

const useGetSuggestedUsers = () => {

    const [isLoading, setIsLoading] = useState(true)
    const [suggestedUsers, setSuggestedUsers] = useState([])
    const authUser = useAuthStore((state) => state.user)
    const {showError} = useShowMessage()


    useEffect(() => {
        const getSuggestedUsers = async() => {
            try {
                setIsLoading(true)
                const userRef = collection(db,"users");
                const q = query(userRef, 
                    where("uid","not-in", [authUser?.uid, ...authUser?.following || []]),
                    orderBy('uid'),
                    limit(5)
                    )

                const querySnapShot = await getDocs(q);
                const users: any =[]

                querySnapShot.forEach(doc => {
                    users.push({...doc.data(), id: doc.id})
                })
                setSuggestedUsers(users)
            } catch (error) {
                if(error  instanceof Error){
                    showError("Error:" + error.message)
                }else{
                    showError("Some unknown error occured")
                }
                
            }finally{
                setIsLoading(false);
            }
        }
        if(authUser) getSuggestedUsers();

    }, [authUser,showError])

  return {isLoading, suggestedUsers }
}

export default useGetSuggestedUsers