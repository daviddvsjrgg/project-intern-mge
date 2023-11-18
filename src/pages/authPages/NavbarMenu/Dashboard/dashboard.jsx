import Bottom from '../../../../components/BottomBar/Bottom';
import Navbar from '../../../../components/Navbar/Navbar';

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from '../../../../config/firebase/firebase';


const Dashboard = () => {
  const [ userEmail, setUserEmail ] = useState('');

  useEffect(()=>{
    onAuthStateChanged(auth, (user) => {
        if (user) {
          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/firebase.User
          const uid = user.email;
          setUserEmail(uid)
          // ...
          console.log("uid", uid)
        } else {
          // User is signed out
          // ...
          console.log("user is logged out")
        }
      });
     
}, [])

  return (
    <div className="min-h-full">
      <Navbar />
      
      <header className="bg-white drop-shadow-md">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard, {userEmail}</h1>
        </div>
      </header>

      {/* Start - Content */}
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8"></div>
      </main>
      {/* End - Content */}

     <Bottom />
    </div>
  )
}

export default Dashboard