import { Link } from 'react-router-dom';
interface BreadcrumbProps {
  pageName: string;
}
const Breadcrumb = ({ pageName }: BreadcrumbProps) => {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-row">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          {pageName}
        </h2>
        <span>
          {pageName === 'Profile' ? (
            <Link
              to="/editprofile"
              className="inline-flex items-center justify-center rounded-full bg-primary py-1 px-6 text-center font-medium text-white hover:bg-opacity-90 lg:px-6 xl:px-6 mx-4"
            >
              Edit
            </Link>
          ) : (
            <></>
          )}
        </span>
      </div>

      <nav>
        <ol className="flex items-center gap-2">
          <li>
            <Link className="font-medium" to="/">
              Dashboard /
            </Link>
          </li>
          <li className="font-medium text-primary">{pageName}</li>
        </ol>
      </nav>
    </div>
  );
};

export default Breadcrumb;
