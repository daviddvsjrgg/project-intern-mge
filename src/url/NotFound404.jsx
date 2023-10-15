import React from 'react'
import Navbar from '../components/Navbar/Navbar'
import Bottom from '../components/BottomBar/Bottom'


const NotFound404 = () => {
  return (
    <div>
      <Navbar />
         <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
         <div className="text-center">
          <p className="text-6xl font-semibold text-indigo-600">404</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">Halaman Tidak Ada</h1>
          <p className="mt-6 text-base leading-7 text-gray-600">Maaf, halaman yang anda cari tidak ada.</p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="/"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Kembali ke Dashboard
            </a>
            <a href="/" className="text-sm font-semibold text-gray-900">
              Hubungi Developer <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>
      </main>
      <Bottom />
    </div>
  )
}

export default NotFound404