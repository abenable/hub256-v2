import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import ChooseCategory from '../components/Forms/SelectGroup/ChooseCategory';
import DefaultLayout from '../layout/DefaultLayout';
import axios from 'axios';
import { useState } from 'react';

const CreateBlog = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!image) {
      alert('Please select a file.');
      return;
    }
    try {
      const data = new FormData();
      data.append('title', title);
      data.append('description', description);
      data.append('content', content);
      data.append('image', image);
      data.append('category', category);

      console.log(data);

      await axios.post(`/blog/post`, data);
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
                <ChooseCategory category={category} setCategory={setCategory} />
                <div className="mb-4">
                  <label className="mb-3 block text-black dark:text-white">
                    Blog Image
                  </label>
                  <input
                    type="file"
                    name="image"
                    formEncType="multipart/form-data"
                    onChange={(e: any) => {
                      setImage(e.target.files[0]);
                    }}
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
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                      />
                    </svg>
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
