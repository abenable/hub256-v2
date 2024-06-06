import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import ChooseCategory from '../components/Forms/SelectGroup/ChooseCategory';
import DefaultLayout from '../layout/DefaultLayout';
import axios from 'axios';
import { useState } from 'react';

const CreateBlog = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urlToImg, setUrlToImg] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/blog/post`, {
        title,
        description,
        urlToImg,
        content,
        category,
      });
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <DefaultLayout>
      <div className="mx-auto max-w-270">
        <Breadcrumb pageName="New Blog" />

        <div className="col-span-5 xl:col-span-3 md:w-3/4 mx-auto">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark ">
            <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Blog Details{' '}
              </h3>
            </div>
            <div className="p-7">
              <form>
                <div className="mb-4">
                  <label className="mb-3 block text-black dark:text-white">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e: any) => {
                      setTitle(e.target.value);
                    }}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>
                <div className="mb-4">
                  <label className="mb-3 block text-black dark:text-white">
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    value={description}
                    onChange={(e: any) => {
                      setDescription(e.target.value);
                    }}
                    placeholder="Write a brief description about the blog."
                    rows={2}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-1 px-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>{' '}
                <ChooseCategory />
                <div className="mb-4">
                  <label className="mb-3 block text-black dark:text-white">
                    Blog Image
                  </label>
                  <input
                    type="file"
                    className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-3 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
                  />
                </div>
                <div className="mb-4">
                  <label className="mb-3 block text-black dark:text-white">
                    Blog Content
                  </label>
                  <textarea
                    value={content}
                    onChange={(e: any) => {
                      setContent(e.target.value);
                    }}
                    rows={3}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="inline-flex items-center justify-center rounded-md bg-black py-3 px-8 text-center font-medium text-white hover:bg-opacity-90 lg:px-6 xl:px-10 mx-auto"
                >
                  <span className="mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="size-5"
                    >
                      <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.262a1.75 1.75 0 0 0 0-2.474Z" />
                      <path d="M4.75 3.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25V9A.75.75 0 0 1 14 9v2.25A2.75 2.75 0 0 1 11.25 14h-6.5A2.75 2.75 0 0 1 2 11.25v-6.5A2.75 2.75 0 0 1 4.75 2H7a.75.75 0 0 1 0 1.5H4.75Z" />
                    </svg>{' '}
                  </span>
                  Create Blog
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default CreateBlog;
