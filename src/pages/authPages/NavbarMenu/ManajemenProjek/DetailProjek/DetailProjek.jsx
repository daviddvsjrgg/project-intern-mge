import React, { Fragment, useEffect, useRef, useState } from 'react'
import Navbar from '../../../../../components/Navbar/Navbar'
import Bottom from '../../../../../components/BottomBar/Bottom'
import { useLocation, useNavigate } from 'react-router-dom'
import { collection, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { db } from '../../../../../config/firebase/firebase'
import { Combobox, Dialog, Listbox, Transition } from '@headlessui/react'
import { UserIcon } from '@heroicons/react/24/solid'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import { v4 as uuidv4 } from 'uuid';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage'

const status = [
    { name: 'Pilih status', color: 'text-gray-100' },
    { name: 'Active', color: 'text-gray-900' },
    { name: 'Maintenance', color: 'text-gray-900' },
    { name: 'Deactive', color: 'text-gray-900' },
    ]

const numberWa = '628990256825';
const text = "Hai David, sepertinya halaman ini bermasalah (url)"

const DetailProjek = () => {
    
    const location = useLocation();
    const projectData = location.state ? location.state.projectData : null;
    
    const [ desc, setDesc ] = useState(projectData.descriptionProject || '');
    const [ data, setData ] = useState([]);

    const [ errorMessagePIC, setErrorMessagePIC] = useState('');

    const [ imageLoaded, setImageLoaded ] = useState(false);
    const [ selectedImagePreview, setSelectedImagePreview ] = useState(null);

    const [selectedStatus, setSelectedStatus] = useState(status[0])

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    const handleFileInputChange = async (event) => {
        const file = event.target.files[0];
    
        if (file) {
            const reader = new FileReader();
    
            const imageUrl = URL.createObjectURL(file);
            setSelectedImagePreview(imageUrl);
            setImageLoaded(true);
    
            reader.readAsDataURL(file);
            console.log('Selected file:', file);
            
            const imageName = `${uuidv4()}`
            const storage = getStorage();
            const storageRef = ref(storage, `ProjekFile/${imageName}`);
    
            try {
                // Upload the file
                await uploadBytes(storageRef, file);
    
                // Get the download URL
                const downloadURL = await getDownloadURL(storageRef);
                console.log('File uploaded successfully. Download URL:', downloadURL);
    
                try {
                    const usersCollection = collection(db, "projects");
    
                    const querySnapshot = await getDocs(query(usersCollection,
                        where("idProject", "==", projectData.idProject),
                    ));
    
                    const doc = querySnapshot.docs[0];
    
                    // Delete the previous image if it exists
                    const previousImageUrl = doc.data().imageUrlProject;
                    if (previousImageUrl) {
                        const previousImageRef = ref(storage, `ProjekFile/${projectData.imageNameProject}`);
                        await deleteObject(previousImageRef);
                        console.log('Previous image deleted successfully.');
                    }
    
                    // Update the Firestore document with the new image URL
                    await updateDoc(doc.ref, {
                        imageUrlProject: downloadURL,
                        imageNameProject: imageName,
                    });
                    // setButtonLoading(true);
                    setCount(3);
                    setOpen(true);
                    
                    setTimeout(() => {
                        setOpen(false);
                        // navigate('/manajemen-projek');
                    }, 3500);
                } catch (error) {
                    console.log("Err Update Image: " + error);
                    const usersCollection = collection(db, "projects");
    
                    const querySnapshot = await getDocs(query(usersCollection,
                        where("idProject", "==", projectData.idProject),
                    ));
    
                    const doc = querySnapshot.docs[0];
                    await updateDoc(doc.ref, {
                        imageUrlProject: downloadURL,
                        imageNameProject: imageName,
                    });
                    // setButtonLoading(true);
                    setCount(3);
                    setOpen(true);
                    
                    setTimeout(() => {
                        setOpen(false);
                        // navigate('/manajemen-projek');
                    }, 3500);
                    
                }
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        }
    };
    

    useEffect(() =>{
        const fetchData = async () => {
        const usersCollection = collection(db, "users");

        try {
            const snapshot = await getDocs(usersCollection);
            const fetchedData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            }));
            setData(fetchedData);
        } catch (error) {
            console.log("Error fetching data: ", error);
        }
        }
        fetchData();
    }, []);

    const [selected, setSelected] = useState(data[0])
    const [queryFilter, setQuery] = useState('')

    const filteredPeople =
    queryFilter === ''
      ? data
      : data.filter((person) =>
          person.usernameUser
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(queryFilter.toLowerCase().replace(/\s+/g, ''))
        )

    const getDesc = (event) => {
        setDesc(event.target.value)
    }
 
    const navigate = useNavigate();

    const [ buttonLoading, setButtonLoading ] = useState(false)

    const handleClickSimpan = async (e) => {
        e.preventDefault();

        const statusToString = document.getElementById("statusId");
        const statusText = statusToString.innerText;
        console.log("Status: " + statusText);

        const getLabel = document.getElementById("labelProject").value;

        const getPengguna = document.getElementById('pic').value;
        const setPengguna = getPengguna.toString();
        
        const usersCollection = collection(db, "projects");
        
        // Check ID
        const querySnapshot = await getDocs(query(usersCollection,
            where("nameProject", "==", projectData.nameProject),
            where("labelProject", "==", projectData.labelProject),
            where("idProject", "==", projectData.idProject),
        ));
        
        if (querySnapshot.size === 0) {
            // No existing document found
            console.log("Terjadi Kesalahan");
        } else {
            const doc = querySnapshot.docs[0];
        
            // Compare existing values with new values
            const existingLabel = doc.data().labelProject;
            const existingDescription = doc.data().descriptionProject;
            const existingPengguna = doc.data().picProject;
        
            if (existingPengguna === setPengguna) {
               // PIC sama
                setErrorMessagePIC("Penanggung jawab tidak boleh sama.");
                
            } else if (statusText === "Pilih status") {
                if(selected) {
                    try {
                        await updateDoc(doc.ref, {
                        labelProject: getLabel,
                        descriptionProject: desc,
                        picProject: setPengguna
                    });
        
                    setButtonLoading(true);
                    setCount(3);
                    setOpen(true);
                    
                    setTimeout(() => {
                        navigate('/manajemen-projek');
                    }, 3500);
        
                    console.log("Ubah tanpa PIC: ", doc.id);
                    } catch (e) {
                        // Handle the error during document update
                        console.error("Error updating document: ", e);
                    }
                } else {
                    try {
                        await updateDoc(doc.ref, {
                        labelProject: getLabel,
                        descriptionProject: desc,
                    });
        
                    setButtonLoading(true);
                    setCount(3);
                    setOpen(true);
                    
                    setTimeout(() => {
                        navigate('/manajemen-projek');
                    }, 3500);
        
                    console.log("Ubah tanpa PIC: ", doc.id);
                    } catch (e) {
                        // Handle the error during document update
                        console.error("Error updating document: ", e);
                    }
                    setButtonLoading(true);
                     setCount(3);
                     setOpen(true);
                     setTimeout(() => {
                         navigate('/manajemen-projek');
                     }, 3500);
                     console.log("No changes status.");
                }
                
            } else if (existingLabel === getLabel && existingDescription === desc && (existingPengguna === null || existingPengguna === '') ) {
                 // No changes, do not update the document
                 setButtonLoading(true);
                 setCount(3);
                 setOpen(true);
                 setTimeout(() => {
                     navigate('/manajemen-projek');
                 }, 3500);
                 console.log("No changes.");
            } else {
                if (selected) {
                    setErrorMessagePIC("");
                    console.log("PIC Berubah")
                    try {
                        await updateDoc(doc.ref, {
                            labelProject: getLabel,
                            descriptionProject: desc,
                            picProject: setPengguna,
                            statusProject: statusText
                        });
                         setButtonLoading(true);
                         setCount(3);
                         setOpen(true);
                        
                         setTimeout(() => {
                             navigate('/manajemen-projek');
                         }, 3500);
                    } catch (error) {
                        console.log("PIC err: " + error)
                    }
                } else {
                    try {
                        // Document with the same nameProject and labelProject found, update the existing document
                        await updateDoc(doc.ref, {
                        labelProject: getLabel,
                        descriptionProject: desc,
                        statusProject: statusText
                    });
        
                    setButtonLoading(true);
                    setCount(3);
                    setOpen(true);
                    
                    setTimeout(() => {
                        navigate('/manajemen-projek');
                    }, 3500);
        
                    console.log("Ubah tanpa PIC: ", doc.id);
                    } catch (e) {
                        // Handle the error during document update
                        console.error("Error updating document: ", e);
                    }
                }
            }
        }
    }

    // Modal
    const [open, setOpen] = useState(false)
    const cancelButtonRef = useRef(null)

    // Countdown
    const [count, setCount] = useState(null);

    useEffect(() => {
        const countdownInterval = setInterval(() => {
        if (count > 0) {
            setCount(prevCount => prevCount - 1);
        } else {
            clearInterval(countdownInterval);
            // Add any additional actions you want to perform after the countdown
        }
        }, 1000);

        // Cleanup the interval when the component unmounts
        return () => clearInterval(countdownInterval);
    }, [count]);

    

  return (
    <div className="min-h-full">
        <Navbar />
        {/* Modal */}
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setOpen}>
            <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div className="fixed inset-0 bg-gray-500 bg-opacity-40 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    enterTo="opacity-100 translate-y-0 sm:scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                    leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                    <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <div
                        className="sm:flex sm:items-start">
                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-200 sm:mx-0 sm:h-10 sm:w-10 animate-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                        </svg>
                        </div>
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                            <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                            Data berhasil diubah
                            </Dialog.Title>
                            <div className="mt-2">
                            <p className="text-sm text-gray-500">
                                Data kamu berhasil diubah, kamu akan otomatis kembali dalam waktu {count} detik.
                            </p>
                            </div>
                        </div>
                        </div>
                    </div>
                    </Dialog.Panel>
                </Transition.Child>
                </div>
            </div>
            </Dialog>
        </Transition.Root>
        {/* End Modal */}
            <header className="bg-white drop-shadow-md">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Detail Mata Kuliah</h1>
                </div>
            </header>

            {/* Start - Content */}
            <main>
                <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
                    {projectData ? (
                        <div>
                             <div className="md:w-1/3 scale-100 transition-all duration-400 hover:scale-105 px-2">
                                {projectData.imageUrlProject ? (
                                    <div className="h-full rounded-xl shadow-cla-blue bg-gradient-to-tr from-gray-50 to-indigo-50 overflow-hidden hover:shadow-md relative hover:opacity-90">
                                    <label htmlFor="imageInput" className="block w-full h-full cursor-pointer">
                                      {!imageLoaded && (
                                        <div className="placeholder">
                                          <div role="status" className="space-y-8 animate-pulse md:space-y-0 md:space-x-8 rtl:space-x-reverse md:flex md:items-center">
                                            <div className="flex items-center justify-center w-full h-48 bg-gray-300 rounded sm:w-96 dark:bg-gray-700">
                                              <svg className="w-10 h-10 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                                                <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z"/>
                                              </svg>
                                            </div>
                                            <span className="sr-only">Loading...</span>
                                          </div>
                                        </div>
                                      )}
                                      <img
                                        className={`lg:h-auto md:h-auto w-full object-center scale-110 transition-all duration-400 ${imageLoaded ? 'visible' : 'hidden'}`}
                                        src={selectedImagePreview || projectData.imageUrlProject}
                                        alt="blog"
                                        loading="eager"
                                        onLoad={handleImageLoad}
                                        onClick={() => document.getElementById('imageInput').click()}
                                      />
                                      <div className={`absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-90 transition-opacity ${imageLoaded ? 'visible' : 'hidden'}`}>
                                        <p className="text-white text-lg font-bold">Ganti Foto</p>
                                      </div>
                                    </label>
                                    <input
                                      type="file"
                                      id="imageInput"
                                      accept="image/*"
                                      style={{ display: 'none' }}
                                      onChange={handleFileInputChange}
                                    />
                                  </div>
                                ) : (
                                    <div role="status" className="space-y-8 animate-pulse md:space-y-0 md:space-x-8 rtl:space-x-reverse md:flex md:items-center">
                                        <div className="flex items-center justify-center w-full h-48 bg-gray-300 rounded sm:w-96 dark:bg-gray-700">
                                            <svg className="w-10 h-10 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                                            <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z"/>
                                            </svg>
                                        </div>
                                        <span className="sr-only">Loading...</span>
                                    </div>
                                )}
                            </div>
                        <div className="px-4 sm:px-0">
                            <h3 className="text-base font-semibold leading-7 text-gray-900 mt-4">Detail Mata Kuliah</h3>
                            <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">Informasi Mata Kuliah berisi gambar, pengguna terkait, dan detail lainnya.</p>
                        </div>
                        <div className="mt-6 border-t border-gray-100">
                            <dl className="divide-y divide-gray-100">
                            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                <dt className="text-sm font-medium leading-6 text-gray-900">Mata Kuliah</dt>
                                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{projectData.nameProject}</dd>
                            </div>
                            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                <dt className="text-sm font-medium leading-6 text-gray-900">Penanggung Jawab</dt>
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                    <img className="h-10 w-10 rounded-full" src={projectData.userData.imageUser} alt=":/" />
                                    </div>
                                    <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{projectData.userData.usernameUser}</div>
                                    <div className="text-sm text-gray-500">{projectData.userData.positionUser}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                <dt className="text-sm font-medium leading-6 text-gray-900">Email</dt>
                                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{projectData.userData.emailUser}</dd>
                            </div>
                            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                <dt className="text-sm font-medium leading-6 text-gray-900">Label</dt>
                                <input 
                                    type="text" 
                                    name="labelProject" 
                                    id="labelProject"
                                    defaultValue={`${projectData.labelProject}`}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6">
                                    </input>
                            </div>
                            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                <dt className="text-sm font-medium leading-6 text-gray-900">Deskripsi</dt>
                                <textarea 
                                    type="text" 
                                    name="descriptionProject" 
                                    id="descriptionProject"
                                    onChange={getDesc}
                                    defaultValue={`${projectData.descriptionProject}`}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6">
                                    </textarea>
                            </div>
                            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                <dt className="text-sm font-medium leading-6 text-gray-900">Tentang Mata Kuliah</dt>
                                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                                    Semua informasi dapat diubah oleh pemilik akun. Dengan ketentuan berlaku. Hanya bisa mengubah "Gambar, Label, Deskripsi, Penanggung Jawab" untuk saat ini, jika ingin mengubah data yang lain kamu bisa menghubungi{' '}
                                    <a href={`https://wa.me/${numberWa}?text=${text}`} className=" text-sm leading-6 text-blue-600">
                                        developer.
                                    </a>
                                </dd>
                            </div>
                            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                <dt className="text-sm font-medium leading-6 text-gray-900">Ganti Penanggung Jawab</dt>
                                <Combobox  defaultValue={selected} onChange={setSelected}>
                                    <div className="relative">
                                        <div className="relative w-full cursor-default overflow-hidden bg-white text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible focus-visible:ring-offset-2 focus-visible:ring-offset-1-300 sm:text-sm">
                                        <Combobox.Input
                                            placeholder='Cari penanggung jawab...'
                                            id="pic"
                                            name="pic"
                                            autoComplete="off"
                                            className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                                                errorMessagePIC ? 'ring-red-600' : 'ring-gray-300'
                                              }`}
                                            displayValue={(person) => person.emailUser}
                                            onChange={(event) => setQuery(event.target.value)}
                                        />
                                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                            <ChevronDownIcon
                                            className="h-5 w-5 text-gray-400"
                                            aria-hidden="true"
                                            />
                                        </Combobox.Button>
                                        </div>
                                        <Transition
                                        as={Fragment}
                                        leave="transition ease-in duration-100"
                                        leaveFrom="opacity-100"
                                        leaveTo="opacity-0"
                                        afterLeave={() => setQuery('')}
                                        >
                                        <Combobox.Options 
                                        className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                            {filteredPeople.length === 0 && queryFilter !== '' ? (
                                            <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                                                Tidak ditemukan.
                                            </div>
                                            ) : (
                                            filteredPeople.map((person) => (
                                                <Combobox.Option
                                                key={person.idUser}
                                                className={({ active }) =>
                                                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                    active ? 'bg-indigo-500 text-white' : 'text-gray-900'
                                                    }`
                                                }
                                                value={person}
                                                >
                                                {({ selected, active }) => (
                                                    <>
                                                    <span
                                                        className={`block truncate ${
                                                        selected ? 'font-medium' : 'font-normal'
                                                        }`}
                                                    >
                                                        {person.usernameUser} - {person.emailUser} 
                                                    </span>
                                                    {selected ? (
                                                        <span
                                                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                                            active ? 'text-white' : 'text-teal-600'
                                                        }`}
                                                        >
                                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                        </span>
                                                    ) : null}
                                                    </>
                                                )}
                                                </Combobox.Option>
                                            ))
                                            )}
                                        </Combobox.Options>
                                        </Transition>
                                        {errorMessagePIC && (
                                            <div className="text-red-500 text-sm mt-1 pl-1">
                                                {errorMessagePIC}  
                                            </div>
                                        )}
                                        <p className="mt-3 text-sm leading-6 text-gray-600 pl-1">Kosongkan jika tidak ingin diubah.</p>
                                    </div>
                                    </Combobox>
                                </div>
                                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                    <dt className="text-sm font-medium leading-6 text-gray-900">Status</dt>

                                    
                                        <div className="">
                                        <Listbox value={selectedStatus} onChange={setSelectedStatus}>
                                            <div className="relative">
                                            <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left ring-1 focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                                                <span id='statusId' className="block truncate">{selectedStatus.name}</span>
                                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                <ChevronDownIcon
                                                    className="h-5 w-5 text-gray-400"
                                                    aria-hidden="true"
                                                />
                                                </span>
                                            </Listbox.Button>
                                            <Transition
                                                as={Fragment}
                                                placeholder='Cari penanggung jawab...'
                                                leave="transition ease-in duration-100"
                                                leaveFrom="opacity-100"
                                                leaveTo="opacity-0"
                                            >
                                                <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                                                {status.map((status, statusId) => (
                                                    <Listbox.Option
                                                    key={statusId}
                                                    className={({ active }) =>
                                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                        active ? 'bg-indigo-500 text-white' : 'text-gray-900'
                                                        }`
                                                    }
                                                    value={status}
                                                    >
                                                    {({ selected }) => (
                                                        <>
                                                        <span
                                                            className={`block truncate ${
                                                            selected ? 'font-medium' : 'font-normal'
                                                            }`}
                                                        >
                                                            {status.name === "Pilih status" ? "Pilih status (Pilih ini jika batal)" : status.name}
                                                        </span>
                                                        {selected ? (
                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-teal-600">
                                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                            </span>
                                                        ) : null}
                                                        </>
                                                    )}
                                                    </Listbox.Option>
                                                ))}
                                                </Listbox.Options>
                                            </Transition>
                                            </div>
                                        </Listbox>
                                        </div>
                                </div>
                            

                            {buttonLoading ? (
                                <div className="mt-6 flex items-center justify-end px-4 py-3 sm:gap-4 sm:px-0">
                                    <button
                                        type="submit"
                                        disabled
                                        className="animate-pulse rounded-md bg-indigo-600 px-10 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                        >
                                    Loading...
                                    </button>
                                </div>
                            ):
                                <div className="mt-6 flex items-center justify-end px-4 py-3 sm:gap-4 sm:px-0">
                                    <button
                                        type="submit"
                                        onClick={handleClickSimpan}
                                        className="rounded-md bg-indigo-600 px-10 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                        >
                                    Simpan
                                    </button>
                                </div>
                            
                            }

                            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                <dt className="text-sm font-medium leading-6 text-gray-900">Daftar Mahasiswa</dt>
                                <dd className="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                <ul className="divide-y divide-gray-100 rounded-md border border-gray-200">
                                    <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                                    <div className="flex w-0 flex-1 items-center">
                                        <UserIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                        <div className="ml-4 flex min-w-0 flex-1 gap-2">
                                        <span className="truncate font-medium">david maszzeh</span>
                                        {/* <span className="flex-shrink-0 text-gray-400">2.4mb</span> */}
                                        </div>
                                    </div>
                                    <div className="ml-4 flex-shrink-0">
                                        <a href="/none" className="font-medium text-indigo-600 hover:text-indigo-500">
                                        Detail
                                        </a>
                                    </div>
                                    </li>
                                    <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                                    <div className="flex w-0 flex-1 items-center">
                                        <UserIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                        <div className="ml-4 flex min-w-0 flex-1 gap-2">
                                        <span className="truncate font-medium">rosi maszzeh</span>
                                        {/* <span className="flex-shrink-0 text-gray-400">4.5mb</span> */}
                                        </div>
                                    </div>
                                    <div className="ml-4 flex-shrink-0">
                                        <a href="/none" className="font-medium text-indigo-600 hover:text-indigo-500">
                                        Detail
                                        </a>
                                    </div>
                                    </li>
                                </ul>
                                </dd>
                            </div>
                            </dl>
                        </div>
                     </div>
                    )
                    
                    :
                        <div className="px-4 sm:px-0">
                            <h3 className="text-base font-semibold leading-7 text-gray-900">Detail Mata Kuliah</h3>
                            <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">mata kuliah tidak ditemukan</p>
                        </div>
                    }
                    
                </div>
            </main>
            {/* End - Content */}
            
        <Bottom />
    </div>
  )
}

export default DetailProjek