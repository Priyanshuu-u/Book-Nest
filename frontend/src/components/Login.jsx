import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from "react-hook-form";
import axios from 'axios';
import toast from 'react-hot-toast';

const url = "https://book-nest-backend-7lyo.onrender.com";
function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const onSubmit = async (data) => {
    const userInfo={
      email:data.email,
      password:data.password
    }
   await axios.post(`{url}/user/login`,userInfo)
    .then((res)=>{
      console.log(res.data);
      if(res.data){
        toast.success('Successfully LoggedIn!')
        document.getElementById('my_modal_3').close()
        setTimeout(()=>{
          
          window.location.reload()
          localStorage.setItem("Users",JSON.stringify(res.data.user))
        },3000)
       
      }
     
    }).catch((err)=>{
     if(err.response){
      toast.error(err.response.data.message);
      setTimeout(()=>{},3000)
     }
    })
  };
  

  return (
    <div className='dark:bg-slate-900 dark:text-white'>
      <dialog id="my_modal_3" className="modal ">
        <div className="modal-box ">
          {/* Close button moved outside the form */}
          <Link to="/" className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => document.getElementById('my_modal_3').close()}>
            ✕
          </Link>

          <h3 className="font-bold text-lg">Login</h3>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className='mt-4 space-y-2'>
              <span>Email</span> <br />
              <input
                type="email"
                placeholder='Enter your Email'
                className='w-80 px-3 py-1 border rounded-md outline-none'
                {...register("email", { required: true })}
              />
              {errors.email && <p className="text-red-500">Email is required</p>}
            </div>

            <div className='mt-4 space-y-2'>
              <span>Password</span> <br />
              <input
                type="password"
                placeholder='Enter your Password'
                className='w-80 px-3 py-1 border rounded-md outline-none'
                {...register("password", { required: true })}
              />
              {errors.password && <p className="text-red-500">Password is required</p>}
            </div>

            <div className='flex justify-around mt-4'>
              <button type="submit" className='bg-pink-500 text-white rounded-md px-3 py-1 hover:bg-pink-700 duration-200'>Login</button>
              <p>Not Registered? <Link to="/signup" className='underline text-blue-500 cursor-pointer'>Sign Up!</Link></p>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
}

export default Login;
